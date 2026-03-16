# Digital Bharat - API Testing Guide

This document contains instructions to test the backend API for the Admin Panel. 

We have enclosed a Postman Collection (`Digital_Bharat_Postman_Collection.json`) that can be directly imported into Postman or Insomnia for quick 1-click testing.

## Prerequisites
1. Ensure the Node.js backend server is running:
   ```bash
   cd backend
   npm run dev
   ```
2. The server usually runs on `http://localhost:5000`
3. Ensure MongoDB is running and connected (check `.env` and terminal output).

## How to use the Postman Collection
1. Open **Postman** desktop app or web browser version.
2. Click **Import** (Top left corner).
3. Select the file: `backend/Digital_Bharat_Postman_Collection.json`.
4. The collection **Digital Bharat Backend API** will appear in your collections list.
5. The `base_url` variable is already set to `http://localhost:5000`.

### Authentication Flow (Important)
All Category and Subcategory operations (except GET all) require an active Admin Token. The collection is configured to handle this automatically:

1. Go to **Authentication > Login Admin**
2. Send the request with the valid credentials (`admin@digital.com` / `password123` or your own data).
3. The response will include a `token`. Postman will **automatically save this token** to the `{{admin_token}}` environment variable.
4. Now, all other authenticated requests (Create, Update, Delete) will automatically use this Bearer token in the headers!

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new admin account | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/me` | Get logged-in admin details | Yes |
| GET | `/api/categories` | Get list of all categories | No |
| POST | `/api/categories` | Create a new category | Yes |
| PUT | `/api/categories/:id` | Update category/change active status | Yes |
| DELETE | `/api/categories/:id` | Delete a category | Yes |
| GET | `/api/subcategories` | Get all subcategories | No |
| POST | `/api/categories/:id/subcategories`| Create a subcategory | Yes |
| PUT | `/api/subcategories/:id`| Update subcategory | Yes |
| DELETE | `/api/subcategories/:id`| Delete subcategory | Yes |

*Note: For PUT and DELETE endpoints in the collection, make sure to replace `:categoryId` and `:subcategoryId` in the URL with actual `_id` values from MongoDB you got from the GET requests.*
