#define AppId "{{7D18A5A6-639F-4E9C-8AF2-BB8A530F8A0C}"
#define AppName "cctv-desktop"
#define AppPublisher "saefulmillah"

#ifndef AppVersion
  #define AppVersion "0.0.0"
#endif

#ifndef AppSourceDir
  #define AppSourceDir "..\..\out\cctv-desktop-win32-x64"
#endif

#ifndef OutputDir
  #define OutputDir "..\..\out\installer-wizard"
#endif

[Setup]
AppId={#AppId}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={autopf}\cctv-desktop
DisableProgramGroupPage=yes
OutputDir={#OutputDir}
OutputBaseFilename=cctv-desktop-{#AppVersion}-wizard-setup
Compression=lzma
SolidCompression=yes
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
WizardStyle=modern
PrivilegesRequired=admin
UninstallDisplayIcon={app}\cctv-desktop.exe

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; Flags: unchecked

[Files]
Source: "{#AppSourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\cctv-desktop"; Filename: "{app}\cctv-desktop.exe"
Name: "{autodesktop}\cctv-desktop"; Filename: "{app}\cctv-desktop.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\cctv-desktop.exe"; Description: "Launch cctv-desktop"; Flags: nowait postinstall skipifsilent

[Code]
var
  ApiConfigPage: TInputQueryWizardPage;

function EscapeJson(const S: string): string;
begin
  Result := S;
  StringChangeEx(Result, '\', '\\', True);
  StringChangeEx(Result, '"', '\"', True);
end;

function IsValidApiBaseUrl(const Url: string): Boolean;
var
  Value: string;
begin
  Value := Lowercase(Trim(Url));
  Result := (Pos('http://', Value) = 1) or (Pos('https://', Value) = 1);
end;

procedure InitializeWizard;
begin
  ApiConfigPage :=
    CreateInputQueryPage(
      wpSelectDir,
      'API Configuration',
      'Configure API_BASE_URL',
      'Enter the API base URL used by this application.'
    );
  ApiConfigPage.Add('API_BASE_URL:', False);
  ApiConfigPage.Values[0] := 'http://localhost:3002';
end;

function NextButtonClick(CurPageID: Integer): Boolean;
var
  Value: string;
begin
  Result := True;
  if CurPageID <> ApiConfigPage.ID then
  begin
    exit;
  end;

  Value := Trim(ApiConfigPage.Values[0]);
  if Value = '' then
  begin
    MsgBox('API_BASE_URL cannot be empty.', mbError, MB_OK);
    Result := False;
    exit;
  end;

  if not IsValidApiBaseUrl(Value) then
  begin
    MsgBox('API_BASE_URL must start with http:// or https://', mbError, MB_OK);
    Result := False;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigDir: string;
  ConfigPath: string;
  JsonContent: string;
begin
  if CurStep <> ssPostInstall then
  begin
    exit;
  end;

  ConfigDir := ExpandConstant('{userappdata}\cctv-desktop');
  ForceDirectories(ConfigDir);
  ConfigPath := ConfigDir + '\app-config.json';
  JsonContent :=
    '{' + #13#10 +
    '  "API_BASE_URL": "' + EscapeJson(Trim(ApiConfigPage.Values[0])) + '"' + #13#10 +
    '}' + #13#10;

  SaveStringToFile(ConfigPath, JsonContent, False);
end;
