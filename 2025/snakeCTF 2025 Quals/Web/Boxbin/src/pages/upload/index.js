export default function Upload({ content, setContent }) {
  return (<>
    <textarea
      className="w-full h-full outline-none p-4 font-mono text-sm bg-black"
      style={{ resize: "none" }}
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder="Start typing your paste here..."
    />
  </>);
}
