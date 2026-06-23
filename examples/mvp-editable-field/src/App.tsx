import { SelectableEditable } from "./SelectableEditable";

function App() {
    return (
        <div className="flex flex-col gap-4 m-10 max-w-40">
            <SelectableEditable className="p-3 border rounded text-lg font-medium">
                Click once to select, click again to edit
            </SelectableEditable>
            <SelectableEditable className="p-3 border rounded text-gray-600">
                Every element shares the same two‑click behavior
            </SelectableEditable>
            <SelectableEditable className="p-3 border rounded">
                Clicking outside deselects everything
            </SelectableEditable>
        </div>
    );
}

export default App;
