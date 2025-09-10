import Button from "@/components/Button";

export default function Upgrades() {
  const Upgrades = [
    {
      name: "VIB",
      preview: "Anonymous [VIB]",
      color: "Purple 500",
      colorText: "text-purple-500",
      pasteHighlight: "Purple 500/20",
      pasteBackground: "bg-purple-500/20",
      privatePastes: "No",
      pasteEdits: "No",
      usernameEdits: 1
    },
    {
      name: "Box cutter",
      preview: "Anonymous [Box cutter]",
      color: "Slate 500",
      colorText: "text-slate-500",
      pasteHighlight: "Slate 500/20",
      pasteBackground: "bg-slate-500/20",
      privatePastes: "No",
      pasteEdits: "Yes",
      usernameEdits: 2
    },
    {
      name: "Box lover 9000",
      preview: "Anonymous [Box bin]",
      color: "Red 500",
      colorText: "text-red-500",
      pasteHighlight: "Red 500/20",
      pasteBackground: "bg-red-500/20",
      pasteEdits: "Yes",
      privatePastes: "Yes",
      usernameEdits: "Unlimited"
    },
  ];

  return (<>
    <div className="max-w-7xl grid grid-cols-4 mx-auto gap-4 mt-12">
      {
        Upgrades.map((upgrade, index) => (
          <div key={index} className="border border-white/10 p-3">
            <p className="text-xl font-medium flex">
              <span className={upgrade.colorText}>{upgrade.name}</span>
            </p>

            <hr className="my-3 border-white/10" />

            <p className="flex text-sm">
              Preview
              <span className={`ml-auto font-semibold ${upgrade.colorText}`}>{upgrade.preview}</span>
            </p>

            <p className="flex text-sm">
              Color
              <span className={`ml-auto font-semibold ${upgrade.colorText}`}>
                {upgrade.color}
              </span>
            </p>

            <p className="flex text-sm">
              Paste highlight
              <span className={`ml-auto font-semibold ${upgrade.pasteBackground} ${upgrade.colorText} px-1`}>
                {upgrade.pasteHighlight}
              </span>
            </p>

            <p className="flex text-sm">
              Paste edits
              <span className="ml-auto font-semibold">{upgrade.pasteEdits}</span>
            </p>

            <p className="flex text-sm">
              Private pastes
              <span className="ml-auto font-semibold">{upgrade.privatePastes}</span>
            </p>

            <p className="flex text-sm">
              Username edits
              <span className="ml-auto font-semibold">{upgrade.usernameEdits}</span>
            </p>

            <Button className="w-full mt-10" onClick={() => alert("ngl i haven't implemented ts yet 🥀😭")}>
              Purchase
            </Button>
          </div>
        ))
      }

      <div className="border border-white/10 p-3 flex flex-col">
        <p className="text-xl font-medium flex">
          Change Color
        </p>

        <hr className="my-3 border-white/10" />

        <p className="flex text-sm">
          Ability to change color
          <span className="ml-auto font-semibold">Yes</span>
        </p>

        <p className="flex text-sm">
          Amount of colors
          <span className="ml-auto font-semibold">4.294.967.296</span>
        </p>

        <Button className="w-full mt-auto" onClick={() => alert("ngl i haven't implemented ts yet 🥀😭")}>
          Purchase
        </Button>
      </div>
    </div>
  </>);
}