export interface TextContent {
    type: "text";
    content: string;
}

export interface ImageContent {
    type: "image";
    url: string;
}

export interface LinkContent {
    type: "link";
    link: string;
    text: string;
}

export type Data = { placeholder_id: string } & (TextContent | ImageContent | LinkContent);
