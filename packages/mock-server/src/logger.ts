// Standard ANSI escape sequences (Zero dependencies)
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

export function formatMethod(method: string): string {
  const rawMethod = method.trim().toLowerCase();
  const paddedMethod = method.toUpperCase().padEnd(6);

  switch (rawMethod) {
    case "get":
      return `${colors.green}${colors.bold}${paddedMethod}${colors.reset}`;
    case "post":
      return `${colors.yellow}${colors.bold}${paddedMethod}${colors.reset}`;
    case "put":
      return `${colors.blue}${colors.bold}${paddedMethod}${colors.reset}`;
    case "patch":
      return `${colors.magenta}${colors.bold}${paddedMethod}${colors.reset}`;
    case "delete":
      return `${colors.red}${colors.bold}${paddedMethod}${colors.reset}`;
    default:
      return `${colors.cyan}${colors.bold}${paddedMethod}${colors.reset}`;
  }
}

export function formatStatus(statusCode: number): string {
  const codeStr = `${statusCode}`;
  if (statusCode >= 200 && statusCode < 300) {
    return `${colors.green}${codeStr}${colors.reset}`;
  }
  if (statusCode >= 300 && statusCode < 400) {
    return `${colors.cyan}${codeStr}${colors.reset}`;
  }
  if (statusCode >= 400 && statusCode < 500) {
    return `${colors.yellow}${codeStr}${colors.reset}`;
  }
  if (statusCode >= 500) {
    return `${colors.red}${codeStr}${colors.reset}`;
  }
  return codeStr;
}
