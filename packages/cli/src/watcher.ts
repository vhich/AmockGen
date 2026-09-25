import chokidar from "chokidar";

export function setupWatcher(specPath: string, onReload: () => Promise<void>) {
  const watcher = chokidar.watch(specPath, { ignoreInitial: true });

  watcher.on("change", async (changedPath) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(
      `\n[${timestamp}] 🔄 File change detected in ${changedPath}. Triggering reload...`,
    );

    try {
      await onReload();
      console.log(
        `[${new Date().toLocaleTimeString()}] ✅ Mock server & docs successfully reloaded!\n`,
      );
    } catch (error) {
      console.error(
        `[${new Date().toLocaleTimeString()}] ❌ Error reloading server:`,
        error,
      );
    }
  });

  return watcher;
}
