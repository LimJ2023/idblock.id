import { useMutation } from "@tanstack/react-query";

import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { useToast } from "@/hooks/use-toast";
import { LogOut, MessageCircleMore, QrCode, UsersRound } from "lucide-react";
import { mangerLogout } from "@/api/manager.auth.api";

const SideNavigationManager = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { mutateAsync } = useMutation({ mutationFn: mangerLogout });

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
            <NavLink
              data-state={pathname === "/manager/qr" ? "active" : "inactive"}
              className={cn(
                "mb-1 flex items-center gap-4 rounded-lg px-3.5 py-2.5 text-sm text-[#1E1E1E] transition-colors",
                "hover:bg-[#FF5520] hover:text-white",
                "data-[state=active]:bg-[#FF5520] data-[state=active]:text-white",
              )}
              to="/manager/qr"
            >
              <QrCode className="h-[20px] w-[20px]" />
              <span>QR 촬영</span>
            </NavLink>
            <NavLink
              data-state={
                pathname === "/manager/visitors" ? "active" : "inactive"
              }
              className={cn(
                "mb-1 flex items-center gap-4 rounded-lg px-3.5 py-2.5 text-sm text-[#1E1E1E] transition-colors",
                "hover:bg-[#FF5520] hover:text-white",
                "data-[state=active]:bg-[#FF5520] data-[state=active]:text-white",
              )}
              to="/manager/visitors"
            >
              <UsersRound className="h-[20px] w-[20px]" />
              <span>방문객 리스트</span>
            </NavLink>
            <NavLink
              data-state={
                pathname === "/manager/reviews" ? "active" : "inactive"
              }
              className={cn(
                "mb-1 flex items-center gap-4 rounded-lg px-3.5 py-2.5 text-sm text-[#1E1E1E] transition-colors",
                "hover:bg-[#FF5520] hover:text-white",
                "data-[state=active]:bg-[#FF5520] data-[state=active]:text-white",
              )}
              to="/manager/reviews"
            >
              <MessageCircleMore className="h-[20px] w-[20px]" />
              <span>방문 후기</span>
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

export { SideNavigationManager };
