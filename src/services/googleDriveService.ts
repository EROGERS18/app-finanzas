/**
 * Servicio de Sincronización Privada con Google Drive
 * Permite guardar y descargar los datos de DomiFinan desde el Google Drive del usuario (Google Workspace)
 */

export interface GoogleDriveSyncMetadata {
  lastSyncedAt: string;
  deviceInfo: string;
  version: string;
}

const FILE_NAME = 'domifinan_backup_data.json';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

class GoogleDriveService {
  private tokenClient: any = null;
  private accessToken: string | null = null;

  constructor() {
    // Cargar Access Token previo si existe en session/local storage
    const savedToken = localStorage.getItem('domifinan_gdrive_access_token');
    if (savedToken) {
      this.accessToken = savedToken;
    }
  }

  /**
   * Carga el script oficial de Google Identity Services dinámicamente
   */
  public async loadGoogleGSI(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).google?.accounts?.oauth2) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Inicializa el cliente OAuth2 de Google con el Client ID
   */
  public initTokenClient(clientId: string, onTokenReceived: (token: string) => void) {
    if ((window as any).google?.accounts?.oauth2) {
      this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.access_token) {
            this.accessToken = response.access_token;
            localStorage.setItem('domifinan_gdrive_access_token', response.access_token);
            onTokenReceived(response.access_token);
          }
        },
      });
    }
  }

  /**
   * Solicita al usuario autorizar el acceso a Google Drive
   */
  public requestAccessToken() {
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  }

  public setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('domifinan_gdrive_access_token', token);
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public isConnected(): boolean {
    return !!this.accessToken;
  }

  public disconnect() {
    this.accessToken = null;
    localStorage.removeItem('domifinan_gdrive_access_token');
  }

  /**
   * Guarda / Actualiza la base de datos de DomiFinan en el Google Drive del usuario
   */
  public async uploadDataToDrive(appDataJson: object): Promise<{ success: boolean; fileId?: string; error?: string }> {
    if (!this.accessToken) {
      return { success: false, error: 'No se ha iniciado sesión con Google Drive' };
    }

    try {
      // 1. Buscar si ya existe el archivo en Google Drive
      const existingFileId = await this.findBackupFileId();

      const metadata = {
        name: FILE_NAME,
        mimeType: 'application/json',
        description: 'Copia de seguridad cifrada de DomiFinan Control Financiero'
      };

      const fileContent = JSON.stringify({
        appName: 'DomiFinan',
        version: '1.0.0',
        syncedAt: new Date().toISOString(),
        data: appDataJson
      }, null, 2);

      const blob = new Blob([fileContent], { type: 'application/json' });

      if (existingFileId) {
        // Actualizar archivo existente (PATCH / PUT)
        const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;
        const response = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: blob,
        });

        if (!response.ok) {
          if (response.status === 401) {
            this.disconnect();
            return { success: false, error: 'La sesión de Google expiró. Por favor vuelve a conectar tu cuenta.' };
          }
          throw new Error(`Error actualizando archivo en Drive: ${response.statusText}`);
        }

        return { success: true, fileId: existingFileId };
      } else {
        // Crear nuevo archivo (POST multipart)
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', blob);

        const createUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        const response = await fetch(createUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: form,
        });

        if (!response.ok) {
          if (response.status === 401) {
            this.disconnect();
            return { success: false, error: 'La sesión de Google expiró. Por favor vuelve a conectar tu cuenta.' };
          }
          throw new Error(`Error creando archivo en Drive: ${response.statusText}`);
        }

        const resData = await response.json();
        return { success: true, fileId: resData.id };
      }
    } catch (err: any) {
      console.error('Error al guardar en Google Drive:', err);
      return { success: false, error: err.message || 'Error de conexión con Google Drive' };
    }
  }

  /**
   * Descarga la copia de seguridad más reciente desde Google Drive
   */
  public async downloadDataFromDrive(): Promise<{ success: boolean; data?: any; syncedAt?: string; error?: string }> {
    if (!this.accessToken) {
      return { success: false, error: 'No se ha iniciado sesión con Google Drive' };
    }

    try {
      const fileId = await this.findBackupFileId();
      if (!fileId) {
        return { success: false, error: 'No se encontró ningún archivo de respaldo en tu Google Drive.' };
      }

      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.disconnect();
          return { success: false, error: 'La sesión de Google expiró. Por favor vuelve a conectar tu cuenta.' };
        }
        throw new Error('Error al descargar datos desde Google Drive');
      }

      const parsed = await response.json();
      return {
        success: true,
        data: parsed.data || parsed,
        syncedAt: parsed.syncedAt
      };
    } catch (err: any) {
      console.error('Error al descargar de Google Drive:', err);
      return { success: false, error: err.message || 'Error al conectar con Google Drive' };
    }
  }

  /**
   * Busca el ID del archivo domifinan_backup_data.json en el Drive del usuario
   */
  private async findBackupFileId(): Promise<string | null> {
    if (!this.accessToken) return null;

    const query = encodeURIComponent(`name = '${FILE_NAME}' and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  }
}

export const googleDriveService = new GoogleDriveService();
