const TRACE_ID = "service-upload-trace-2026-10-31-v1";

type TraceStatus = "started" | "completed" | "failed";

type TraceDetails = Record<string, string | number | boolean | null | string[]>;

type DiagnosticError = Error & {
  stack?: string;
  code?: unknown;
  status?: unknown;
  statusCode?: unknown;
  cause?: unknown;
  customData?: { serverResponse?: unknown };
};

function getSafeStackFrames(stack: string | undefined): string[] {
  if (!stack) return [];

  return stack
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const match = line.match(
        /^\s*at\s+(?:(?:async\s+)?([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*|<anonymous>))(?=\s|\()/,
      );
      return match?.[1] ?? null;
    })
    .filter((frame): frame is string => frame !== null)
    .slice(0, 8);
}

function getErrorDetails(error: unknown, includeCause = true): TraceDetails {
  if (!(error instanceof Error)) {
    return { errorType: typeof error };
  }

  const diagnosticError = error as DiagnosticError;
  const details: TraceDetails = {
    errorType: error.name,
    errorConstructor: error.constructor.name,
  };
  const stackFrames = getSafeStackFrames(diagnosticError.stack);
  if (stackFrames.length > 0) {
    details.stackFrames = stackFrames;
  }
  if (typeof diagnosticError.code === "string") {
    details.errorCode = diagnosticError.code;
  }
  if (
    typeof diagnosticError.status === "number"
    && Number.isFinite(diagnosticError.status)
  ) {
    details.httpStatus = diagnosticError.status;
  } else if (
    typeof diagnosticError.statusCode === "number"
    && Number.isFinite(diagnosticError.statusCode)
  ) {
    details.httpStatus = diagnosticError.statusCode;
  }
  if (typeof diagnosticError.customData?.serverResponse === "string") {
    details.serverResponseAvailable = diagnosticError.customData.serverResponse.length > 0;
  }

  if (includeCause && diagnosticError.cause instanceof Error) {
    const causeDetails = getErrorDetails(diagnosticError.cause, false);
    details.causeType = causeDetails.errorType as string;
    details.causeConstructor = causeDetails.errorConstructor as string;
    if (typeof causeDetails.errorCode === "string") {
      details.causeCode = causeDetails.errorCode;
    }
    if (typeof causeDetails.httpStatus === "number") {
      details.causeHttpStatus = causeDetails.httpStatus;
    }
    if (Array.isArray(causeDetails.stackFrames)) {
      details.causeStackFrames = causeDetails.stackFrames;
    }
  }

  return details;
}

export function traceServiceUpload(
  stage: string,
  status: TraceStatus,
  details: TraceDetails = {},
): void {
  const message = "[ServiceUploadTrace]";
  const payload = { traceId: TRACE_ID, stage, status, ...details };

  if (status === "failed") {
    console.error(message, payload);
    return;
  }

  console.warn(message, payload);
}

export function traceServiceUploadFailure(stage: string, error: unknown): void {
  traceServiceUpload(stage, "failed", getErrorDetails(error));
}
