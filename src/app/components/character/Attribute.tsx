
type AttributeProps = {
  name: string;
  value: string | number;
  onChange: (name: string, value: string) => void;
}

export const Attribute = (props: AttributeProps) => {
  const { name, value, onChange } = props;

  return (
    <div className="border-2 border-black p-2 bg-white">
      <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
        {name}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full font-black text-sm bg-transparent border-none focus:outline-none focus:ring-0 p-0"
      />
    </div>
  )
}