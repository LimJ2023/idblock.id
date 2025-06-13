import { useMutation } from "@tanstack/react-query";

import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { logout } from "@/api/auth.api";

import { useToast } from "@/hooks/use-toast";
import { LogOut, MapPinned, User } from "lucide-react";

const SideNavigation = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { mutateAsync } = useMutation({ mutationFn: logout });

  const { toast } = useToast();

  const handleLogOut = async () => {
    const result = await mutateAsync();

    if (result.success) {
      navigate("/");
      return;
    }

    toast({
      variant: "destructive",
      title: "로그아웃 실패",
      description: "로그아웃할 수 없습니다!",
    });
  };

  return (
    <div className="flex max-h-screen w-[240px] flex-col border border-[#E5E7EB] bg-[#FFFFFF] p-5 font-pretendard text-white">
      <div className="flex-1">
        <div className="flex h-full w-full flex-col gap-4">
          <img className="w-[42px]" src="/logo.png" alt="" />

          <nav className="flex flex-1 flex-col justify-start pt-11">
            {/* <NavLink
              data-state={pathname === "/main" ? "active" : "inactive"}
              className={cn(
                "px-6 py-4 transition-colors",
                "hover:font-bold hover:text-primary",
                "data-[state=active]:font-bold data-[state=active]:text-primary",
              )}+++++
              to="/main"
            >
              관리자 계정 관리
            </NavLink> */}
            <NavLink
              data-state={pathname === "/main/users" ? "active" : "inactive"}
              className={cn(
                "mb-1 flex items-center gap-4 rounded-lg px-3.5 py-2.5 text-sm text-[#1E1E1E] transition-colors",
                "hover:bg-[#FF5520] hover:text-white",
                "data-[state=active]:bg-[#FF5520] data-[state=active]:text-white",
              )}
              to="/main/users"
            >
              <User className="h-[20px] w-[20px]" />
              <span>사용자 관리</span>
            </NavLink>
            <NavLink
              data-state={pathname === "/main/sites" ? "active" : "inactive"}
              className={cn(
                "flex items-center gap-4 rounded-lg px-3.5 py-2.5 text-sm text-[#1E1E1E] transition-colors",
                "hover:bg-[#FF5520] hover:text-white",
                "data-[state=active]:bg-[#FF5520] data-[state=active]:text-white",
              )}
              to="/main/sites"
            >
              <MapPinned className="h-[20px] w-[20px]" />
              <span>관광지 관리</span>
            </NavLink>
          </nav>

          <div className="flex">
            <Button
              variants="secondary"
              className={cn(
                "flex w-full gap-2 rounded-lg bg-[#F7F7F7] px-3.5 py-2.5 font-pretendard text-sm text-[#666666]",
                "hover:bg-[#415776] hover:text-white",
                "[&_svg]:size-6",
              )}
              onClick={handleLogOut}
            >
              <LogOut className="max-w-[20px]" />
              <span>로그아웃</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SideNavigation };
