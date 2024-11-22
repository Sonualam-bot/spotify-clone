import { useSignIn } from "@clerk/clerk-react";
import { Button } from "./ui/button";

function SignInOAuthButtons() {
  const { signIn, isLoaded } = useSignIn();

  if (!isLoaded) {
    return null;
  }

  const SignInWithGoogle = () => {
    signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/auth-callback",
    });
  };

  return (
    <Button
      variant={"secondary"}
      onClick={SignInWithGoogle}
      className="w-full text-white border-zince-200 h-11"
    >
      Continue with Google
    </Button>
  );
}

export default SignInOAuthButtons;
