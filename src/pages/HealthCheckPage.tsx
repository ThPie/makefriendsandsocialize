declare const BUILD_TIMESTAMP: string;
declare const APP_VERSION: string;

const HealthCheckPage = () => {
  return (
    <div className="min-h-screen bg-background p-8 font-mono text-sm text-foreground">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Health Check</h1>
        <ul className="space-y-2">
          <li className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="text-green-500 font-semibold">OK</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Domain:</span>
            <span>{window.location.hostname}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Build Time:</span>
            <span>{BUILD_TIMESTAMP}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Version:</span>
            <span>{APP_VERSION}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Environment:</span>
            <span>{import.meta.env.MODE}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Path:</span>
            <span>{window.location.pathname}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HealthCheckPage;
