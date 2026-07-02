import { EditableDiv } from "@raurus/react/client";

export default async function Home() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
            <EditableDiv id="home.div1" className="text-black">
                Test Home Div1
            </EditableDiv>
            <br />
            <br />
            <EditableDiv id="home.div2" className="text-black">
                Test Home Div2
            </EditableDiv>
        </div>
    );
}
