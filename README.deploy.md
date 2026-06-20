# EcoQuest Cloud Run Deployment Guide

This guide describes how to build, test, and deploy the EcoQuest Next.js application on Google Cloud Run.

---

## Prerequisites
1. **Google Cloud SDK**: Make sure you have installed and configured the [gcloud CLI](https://cloud.google.com/sdk/docs/install).
2. **Billing Enabled**: Cloud Run and Cloud Build require a Google Cloud Project with billing enabled.
3. **Local Docker (Optional)**: Needed if you wish to run and test the container image locally before pushing to the cloud.

---

## 1. Local Testing (Optional)

To verify the container builds and runs properly on your local environment:

### Step 1: Copy environment variables
Locate your local `.env.local` or `.env.local.example` and note the variables.

### Step 2: Build the Docker image
Run the build command, passing the `NEXT_PUBLIC_*` variables as build arguments:

```bash
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key" \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com" \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project" \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.appspot.com" \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id" \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id" \
  --build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your_measurement_id" \
  --build-arg NEXT_PUBLIC_MAPS_API_KEY="your_maps_key" \
  -t ecoquest .
```

### Step 3: Run the container locally
Start the container and supply the runtime secrets (like `GEMINI_API_KEY`):

```bash
docker run -p 8080:8080 \
  -e GEMINI_API_KEY="your_gemini_api_key_here" \
  ecoquest
```

Open [http://localhost:8080](http://localhost:8080) to test the app.

---

## 2. Deploying to Google Cloud Run

To build and run the application in the cloud, follow these steps:

### Step 1: Authenticate and set your Project ID
Replace `<YOUR_PROJECT_ID>` with your Google Cloud Project ID:

```bash
gcloud auth login
gcloud config set project <YOUR_PROJECT_ID>
```

### Step 2: Enable required services
Enable the Cloud Run, Cloud Build, and Artifact Registry APIs:

```bash
gcloud services enable run.googleapis.com \
                       cloudbuild.googleapis.com \
                       artifactregistry.googleapis.com
```

### Step 3: Create an Artifact Registry Repository
Create a repository named `ecoquest-repo` in your preferred region (e.g., `us-central1`):

```bash
gcloud artifacts repositories create ecoquest-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="EcoQuest Docker Repository"
```

### Step 4: Build the image with Cloud Build using cloudbuild.yaml
Compile and upload the container using Cloud Build. Since `gcloud builds submit` does not support the `--build-arg` flag directly on the command line, we use the `cloudbuild.yaml` file and pass the variables using `--substitutions`:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=\
_FIREBASE_API_KEY="your_api_key",\
_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com",\
_FIREBASE_PROJECT_ID="your_project",\
_FIREBASE_STORAGE_BUCKET="your_project.appspot.com",\
_FIREBASE_MESSAGING_SENDER_ID="your_sender_id",\
_FIREBASE_APP_ID="your_app_id",\
_FIREBASE_MEASUREMENT_ID="your_measurement_id",\
_MAPS_API_KEY="your_maps_key"
```

### Step 5: Deploy the image to Cloud Run
Deploy the compiled container image. Set the region (e.g., `asia-south2` for Delhi), allow unauthenticated access (for public access), and specify the runtime secret keys:

```bash
gcloud run deploy ecoquest \
  --image asia-south2-docker.pkg.dev/<YOUR_PROJECT_ID>/ecoquest-repo/ecoquest:latest \
  --platform managed \
  --region asia-south2 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your_gemini_api_key_here"
```

Once deployment is complete, the CLI will output a Service URL (e.g., `https://ecoquest-xxxxxx-uc.a.run.app`). Open this URL in your browser to verify it.
