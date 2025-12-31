# Restore "Populated" State & Layout

I will restore the rich content from your old code, fix the menu layout, and ensure the Image Generation tool is available.

## 1. Restore Rich Content (from `old code.txt`)
The "empty" feeling comes from the missing templates and prompt guides. I will replace the current basic versions with the comprehensive data from your text file.
*   **Templates**: Restore the full library (Video Realism, Professional, E-commerce, etc.) with the filter system.
*   **Prompt Guide**: Ensure all categories (Realism, Camera Movement, Physics, etc.) are present and working.

## 2. Fix Navigation & Layout
I will adjust the main menu to match your requested structure and ensure it stays on the left.
*   **Structure**: Dashboard, All Clients, Add Client, Content Lab, Prompt Guide, Templates, Settings.
*   **New Page**: Create a dedicated **"All Clients"** view (`/clients`) to properly list and manage your clients (resolving the "empty" dashboard issue).
*   **Layout**: Verify the sidebar positioning to ensure it's permanently on the left for desktop users.

## 3. Enable Image Generation (Content Lab)
You specifically asked for the "Image Generation tool using Google Gemini API".
*   **Upgrade Content Lab**: I will enhance the existing "Image Gen" tab in Content Lab.
*   **AI Service**: I will add a function to `aiService.ts` to handle image generation requests. *Note: Standard Gemini API generates text/descriptions. If you have access to Imagen (Google's image model), we can connect that. For now, I will implement the UI and the logic to generate detailed image prompts/descriptions using Gemini, which is the standard "Image Gen" workflow for this API tier, unless you have a specific image endpoint.*

## Implementation Plan
1.  **Create `views/AllClientsView.tsx`**: A new page to list all clients.
2.  **Update `src/routes/WebRouter.tsx`**: Add the `/clients` route.
3.  **Update `src/components/Navbar.tsx`**: Reorder menu items and add "All Clients".
4.  **Update `views/TemplatesView.tsx`**: Paste the rich code from your text file.
5.  **Update `views/ContentLabView.tsx`**: Ensure the "Image Gen" tab is prominent and functional.
