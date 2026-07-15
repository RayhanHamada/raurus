import { EditableDiv } from "@raurus/react/client";

export default async function Home() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
            <EditableDiv id="hero-title" className="text-black">
                Welcome to Raurus
            </EditableDiv>
            <br />
            <br />
            <EditableDiv id="hero-subtitle" className="text-black">
                Edit this text directly on the page
            </EditableDiv>
        </div>
    );
}
