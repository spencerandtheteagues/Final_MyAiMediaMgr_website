# MyAiMediaMgr - Definitive Configuration & Setup Guide

**Last Updated:** 2025-07-31

## 1. Overview

This document is the single source of truth for the architecture, configuration, and key logic of the MyAiMediaMgr application. It was created to prevent a recurrence of past deployment and runtime issues.

---

## 2. Technology Stack

-   **Backend:** Python 3.11 with the Flask web framework.
-   **Frontend:** JavaScript with the React library, built using Vite.
-   **Database:** SQLite for user and subscription data.
-   **Hosting:** The entire application is deployed as a containerized service on **Google Cloud Run**.

---

## 3. Google Cloud Configuration

This section details the exact cloud setup required for the application to function correctly.

-   **Project ID:** `final-myaimediamgr-website`
-   **Cloud Run Service:** `myaimediamgr-prod`
-   **Region:** `us-central1`

### 3.1. Service Account

The Cloud Run service runs under a dedicated service account with the following identity:

-   **Service Account Email:** `myaimediamgr-service@final-myaimediamgr-website.iam.gserviceaccount.com`

### 3.2. Required IAM Roles

The service account above **must** have the following IAM roles granted at the project level:

-   `roles/aiplatform.user` (Vertex AI User): Allows the service to call the Vertex AI models (Imagen, Gemini).
-   `roles/storage.admin` (Storage Admin): Allows the service to read and write objects in the GCS bucket.
-   `roles/iam.serviceAccountTokenCreator` (Service Account Token Creator): **CRITICAL**. This allows the service account to create the necessary tokens to sign GCS URLs.

### 3.3. Enabled APIs

The following Google Cloud APIs **must** be enabled for the project:

-   `aiplatform.googleapis.com` (Vertex AI API)
-   `iam.googleapis.com` (Identity and Access Management (IAM) API)
-   `iamcredentials.googleapis.com` (IAM Service Account Credentials API)
-   `generativelanguage.googleapis.com` (Generative Language API)
-   `storage.googleapis.com` (Cloud Storage API)

### 3.4. Google Cloud Storage (GCS) Bucket

-   **Bucket Name:** `final-myaimediamgr-website-media`
-   **Access Control:** The bucket is configured with **Uniform bucket-level access**. This is a critical detail. It means that per-object ACLs are disabled. Public access is not granted via `blob.make_public()`. Instead, the application generates temporary, secure **V4 Signed URLs** for all media assets.

---

## 4. Backend Code Architecture & Key Logic

The core logic for content generation is located in `myaimediamgr_project/myaimediamgr-backend/src/routes/content.py`.

### 4.1. Authentication & Initialization

The application uses **Application Default Credentials (ADC)**. The Cloud Run environment automatically provides the credentials of the attached service account.

-   **Vertex AI Client:** Initialized at startup using `vertexai.init(project=PROJECT_ID, location=LOCATION)`.
-   **Generative AI (Veo) Client:** The `google.generativeai` library is configured at startup by loading the `GEMINI_API_KEY` from the Cloud Run environment variables:
    ```python
    # in content.py
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    ```

### 4.2. AI Model Usage

The following specific, versioned model identifiers are used:

-   **Image Generation (Imagen):** `imagegeneration@006`
    ```python
    # in content.py
    from vertexai.preview.vision_models import ImageGenerationModel
    model = ImageGenerationModel.from_pretrained("imagegeneration@006")
    ```
-   **Video Generation (Veo):** `veo-001`
    ```python
    # in content.py
    operation = genai.generate_videos(model="veo-001", ...)
    ```
-   **Text Generation (Gemini):** `gemini-2.5-flash`
    ```python
    # in content.py
    from vertexai.generative_models import GenerativeModel
    model = GenerativeModel("gemini-2.5-flash")
    ```

### 4.3. GCS Signed URL Generation

This is the most critical and previously problematic piece of logic. To avoid container startup failures, the authentication credentials for signing are fetched **inside the request handler**, not at the global scope.

The correct, working pattern is as follows:

```python
# in content.py, inside generate_image_content()

# 1. Upload the file to GCS
blob.upload_from_string(image_bytes, content_type='image/png')

# 2. Get the default credentials provided by the Cloud Run environment
credentials, _ = google.auth.default()

# 3. Refresh the credentials to get a short-lived access token
credentials.refresh(google.auth.transport.requests.Request())

# 4. Generate the signed URL, passing the credentials for IAM signing
signed_url = blob.generate_signed_url(
    version="v4",
    expiration=datetime.now(timezone.utc) + timedelta(minutes=15),
    method="GET",
    service_account_email=credentials.service_account_email,
    access_token=credentials.token,
)
return signed_url
```

---

## 5. Deployment

The project uses a GitOps pipeline. Any push to the `master` branch on the `spencerandtheteagues/Final_MyAiMediaMgr_website` GitHub repository will automatically trigger a new build and deployment via Google Cloud Build.
