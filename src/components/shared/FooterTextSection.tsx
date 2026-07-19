import Link from "next/link";

const FooterTextSection = () => {
  return (
    <div>
      <div className="text-center mt-2">
        <p className="text-[#5C5849] text-[11px] leading-relaxed max-w-70 mx-auto">
          You acknowledge that you read, and agree, to
          <br />
          our{" "}
          <Link href="/terms" className="underline hover:text-[#A19D93]">
            Terms of Service
          </Link>{" "}
          and our{" "}
          <Link href="/privacy" className="underline hover:text-[#A19D93]">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default FooterTextSection;
