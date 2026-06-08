export interface RevocableLinkRequest {
	bucket: string;
	key: string;
	expiresAt?: string;
}

export interface RevocableLinkResult {
	token: string;
	url: string;
	expiresAt?: string;
}

export class WorkerLinkClient {
	async createLink(_request: RevocableLinkRequest): Promise<RevocableLinkResult> {
		throw new Error("Revocable links are reserved but not implemented yet.");
	}
}
