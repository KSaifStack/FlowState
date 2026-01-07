
using System;
using System.Diagnostics;
using System.IO;

public class ProjDirectoryService
{
    // Validate, optionally open the path in the OS file manager, and return info.
    public object HandlePath(string path, bool openInFileManager = true)
    {
        if (string.IsNullOrWhiteSpace(path))
            throw new ArgumentException("Path is required", nameof(path));

        // If you expect directories only, prefer Directory.Exists
        if (!Directory.Exists(path) && !File.Exists(path))
            throw new FileNotFoundException("Path does not exist", path);

        var name = Path.GetFileNameWithoutExtension(path);

        if (openInFileManager)
        {
            try
            {
                // Cross-platform attempt: UseShellExecute = true and set FileName to the path.
                var psi = new ProcessStartInfo
                {
                    FileName = path,
                    UseShellExecute = true
                };
                Process.Start(psi);
            }
            catch
            {
                // Opening might fail in some environments (no UI, Linux without desktop, etc.)
                // Swallow or log — do not crash the API for a UI-open failure.
            }
        }

        // Return any structured data you want the frontend to receive
        return new
        {
            name,
            path,
            exists = true,
            opened = openInFileManager
        };
    }
}