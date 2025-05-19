import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";

import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

import { Eye, EyeClosed } from "lucide-react";
import { ManagerLogin, postManagerLogin } from "@/api/manager.auth.api";

const ManagerRootPage = () => {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const savedEmail = localStorage.getItem("email");

  const [saveEmail, setSaveEmail] = useState(savedEmail ? true : false);

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<ManagerLogin>({
    mode: "onBlur",
    defaultValues: { email: savedEmail ? savedEmail : "" },
  });

  const { mutate } = useMutation<Result<null, string>, Error, ManagerLogin>({
    mutationFn: postManagerLogin,
    onSuccess: (data, variables) => {
      if (data.success) {
        if (saveEmail) {
          localStorage.setItem("email", variables.email);
        } else {
          localStorage.removeItem("email");
        }

        navigate("/manager/qr", { replace: true });
        return;
      }

      setServerError("아이디 또는 비밀번호를 확인하세요.");
    },
  });

  const onValid: SubmitHandler<ManagerLogin> = (data) => {
    setServerError("");
    mutate(data);
  };

  const onInvalid: SubmitErrorHandler<ManagerLogin> = () => {};

  return (
    <div className="flex h-full items-center justify-center bg-[#17171F] font-pretendard">
      <main className="flex h-fit w-[36.375rem] flex-col gap-[3.125rem] rounded-[2.5rem] px-[4.375rem] py-[4.625rem]">
        <img src="/logo.png" alt="" className="mx-auto w-[240px]" />
        <h1 className="text-center text-4xl font-bold text-white">
          관광지 방문 확인 시스템
        </h1>
        <form
          className="flex flex-col gap-7"
          onChange={() => {
            if (serverError !== "") {
              setServerError("");
            }
          }}
          onSubmit={handleSubmit(onValid, onInvalid)}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="font-pretendard text-white">
              아이디
            </Label>
            <div
              className={cn(
                "flex h-14 rounded-[1.25rem] border border-[#CECECE] bg-white px-4 py-2",
                errors.email ? "border-[#FF0000]" : "",
                serverError !== "" ? "border-[#FF0000]" : "",
              )}
            >
              <Input
                {...register("email", { required: true })}
                placeholder="이메일 아이디"
                className={cn(
                  "border-transparent bg-transparent px-2 font-pretendard text-base font-normal",
                  "placeholder:text-base placeholder:text-[#AEAEAE]",
                  "focus-visible:rounded-b-none focus-visible:border-b focus-visible:border-b-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0",
                )}
              />
            </div>

            {errors.email && (
              <p className="text-xs text-[#FF0000]">아이디를 입력하세요.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="font-pretendard text-white">
              비밀번호
            </Label>
            <div
              className={cn(
                "flex h-14 rounded-[1.25rem] border border-[#CECECE] bg-white px-4 py-2",
                errors.password ? "border-[#FF0000]" : "",
                serverError !== "" ? "border-[#FF0000]" : "",
              )}
            >
              <Input
                {...register("password", { required: true })}
                placeholder="비밀번호"
                type={showPassword ? "text" : "password"}
                className={cn(
                  "border-transparent bg-transparent px-2 font-pretendard text-base font-normal",
                  "placeholder:text-base placeholder:text-[#AEAEAE]",
                  "focus-visible:rounded-b-none focus-visible:border-b focus-visible:border-b-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0",
                )}
              />
              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "aspect-square bg-transparent",
                  "hover:bg-neutral-200",
                )}
              >
                {showPassword ? (
                  <Eye className="stroke-neutral-500" />
                ) : (
                  <EyeClosed className="stroke-[#CECECE]" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-xs text-[#FF0000]">비밀번호를 입력하세요.</p>
            )}
            {serverError !== "" && (
              <p className="text-xs text-[#FF0000]">{serverError}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={saveEmail}
              onCheckedChange={() => setSaveEmail(!saveEmail)}
              id="save"
              name="save"
            />
            <Label htmlFor="save" className="font-pretendard text-[#717171]">
              아이디 저장
            </Label>
          </div>
          <Button
            type="submit"
            className={cn(
              "h-14 rounded-full font-pretendard text-2xl font-bold",
              isLoading ? "bg-primary/90" : "",
            )}
          >
            로그인
          </Button>
        </form>
      </main>
    </div>
  );
};

export { ManagerRootPage };
