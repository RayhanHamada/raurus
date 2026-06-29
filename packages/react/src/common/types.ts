export interface TextContent {
    type: "text";
    content: string;
}

export interface ImageContent {
    type: "image";
    url: string;
}

export type Data = { placeholder_id: string } & (TextContent | ImageContent);
