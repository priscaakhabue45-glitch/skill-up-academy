import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Set credentials with refresh token
if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
}

export const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * Get a temporary, authenticated URL for a Google Drive file
 * @param fileId - Google Drive file ID
 * @returns Webview link for the file
 */
export const getAuthenticatedFileUrl = async (fileId: string): Promise<string> => {
    try {
        const response = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink',
        });

        return response.data.webViewLink || response.data.webContentLink || '';
    } catch (error) {
        console.error('Error fetching Google Drive file:', error);
        throw new Error('Failed to fetch file from Google Drive');
    }
};

/**
 * Generate authorization URL for OAuth
 */
export const getAuthUrl = () => {
    const scopes = ['https://www.googleapis.com/auth/drive.readonly'];
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
};

/**
 * Get tokens from authorization code
 */
export const getTokensFromCode = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};
