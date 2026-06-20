import { memo } from 'react';

const KeyValueEditor = memo(({ pairs, onChange, placeholder = 'Key' }) => {
  const addRow = () => onChange([...pairs, { key: '', value: '', enabled: true }]);

  const updateRow = (index, field, value) => {
    const updated = pairs.map((p, i) => i === index ? { ...p, [field]: value } : p);
    onChange(updated);
  };

  const removeRow = (index) => onChange(pairs.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      {pairs.map((pair, i) => (
        <div key={i} className="flex gap-2 items-center">
          {/* Enable/Disable toggle */}
          <input
            type="checkbox"
            checked={pair.enabled}
            onChange={e => updateRow(i, 'enabled', e.target.checked)}
            className="w-4 h-4 accent-[#7c3aed]"
          />
          {/* Key input */}
          <input
            value={pair.key}
            onChange={e => updateRow(i, 'key', e.target.value)}
            placeholder={placeholder}
            className="input-field flex-1 text-sm font-mono"
          />
          {/* Value input */}
          <input
            value={pair.value}
            onChange={e => updateRow(i, 'value', e.target.value)}
            placeholder="Value"
            className="input-field flex-1 text-sm font-mono"
          />
          {/* Remove row */}
          <button
            onClick={() => removeRow(i)}
            className="text-[#545a7a] hover:text-[#f87171] transition-colors px-2 text-lg"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add row button */}
      <button
        onClick={addRow}
        className="text-[#a06efd] text-sm hover:text-[#7c3aed] transition-colors hover:underline"
      >
        + Add {placeholder}
      </button>
    </div>
  );
});

export default KeyValueEditor;