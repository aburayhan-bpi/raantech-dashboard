import CustomButton from "@/components/shared/CustomButton";

const CancelSubmitButton = ({
  handleCancel,
  loading = false,
}: {
  handleCancel: () => void;
  loading?: boolean;
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-end">
        <CustomButton
          className="w-full sm:w-auto md:px-10 border-foreground text-foreground hover:cursor-pointer hover:bg-foreground/1 transition-colors duration-200 shadow-none"
          variant="outline"
          btnText="Cancel"
          type="button"
          onClick={handleCancel}
        />

        <CustomButton
          type="submit"
          btnText="Confirm"
          className="w-full sm:w-auto px-10 bg-primary-2 text-background hover:bg-primary-1 transition-colors duration-200 focus-visible:ring-0 hover:cursor-pointer "
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CancelSubmitButton;
