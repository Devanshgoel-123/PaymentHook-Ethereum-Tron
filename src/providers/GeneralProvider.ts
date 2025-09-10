


export interface GeneralProvider {
    chaindId:number;
    webhookId:string;

    RegisterWebhook:()=>Promise<void>;

    UpdateWebhook:()=>Promise<void>;

    PauseWebhook:()=>Promise<void>;

    StartWebhook:()=>Promise<void>;

    DeleteWebhook:()=>Promise<void>;
    // FetchAllWebhooks:()=>Promise<void>;
}