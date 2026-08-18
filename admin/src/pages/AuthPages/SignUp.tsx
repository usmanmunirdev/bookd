import PageMeta from "../../components/common/PageMeta";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
       <PageMeta
        title="BOOKD SignUp"
        description="Sign Up to BOOKD, Redefines booking tools, offering seamless access to extraordinary experiences."
      />
        <SignUpForm />
    </>
  );
}
