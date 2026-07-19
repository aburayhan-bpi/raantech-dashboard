const FieldRequiredTicker = ({
  labelText,
  labelClassName,
  isRequired,
}: {
  labelText: string;
  labelClassName?: string;
  isRequired?: boolean;
}) => {
  return (
    <div className="relative">
      <label
        className={` w-fit relative block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${labelClassName || ""}`}
      >
        {labelText}
        {isRequired && (
          <span className="absolute bottom-0.5 -right-2 text-error">*</span>
        )}
      </label>
    </div>
  );
};

export default FieldRequiredTicker;
