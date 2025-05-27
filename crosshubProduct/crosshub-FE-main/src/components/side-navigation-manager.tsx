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
    <div className="flex max-h-screen flex-col bg-[#17171F] p-10 font-pretendard text-white">
      <div className="flex-1">
        <div className="flex h-full flex-col gap-4">
          <img src="/logo.png" alt="" />

          <nav className="flex flex-1 flex-col justify-start pt-11">
            <NavLink
              data-state={pathname === "/manager/qr" ? "active" : "inactive"}
              className={cn(
                "flex gap-4 px-6 py-4 text-[#929295] transition-colors",
                "hover:font-bold hover:text-white",
                "data-[state=active]:font-bold data-[state=active]:text-white",
              )}
              to="/manager/qr"
            >
              <QrCode />
              <span>QR 촬영</span>
            </NavLink>
            <NavLink
              data-state={
                pathname === "/manager/visitors" ? "active" : "inactive"
              }
              className={cn(
                "flex gap-4 px-6 py-4 text-[#929295] transition-colors",
                "hover:font-bold hover:text-white",
                "data-[state=active]:font-bold data-[state=active]:text-white",
              )}
              to="/manager/visitors"
            >
              <UsersRound />
              <span>방문객 리스트</span>
            </NavLink>
            <NavLink
              data-state={
                pathname === "/manager/reviews" ? "active" : "inactive"
              }
              className={cn(
                "flex gap-4 px-6 py-4 text-[#929295] transition-colors",
                "hover:font-bold hover:text-white",
                "data-[state=active]:font-bold data-[state=active]:text-white",
              )}
              to="/manager/reviews"
            >
              <MessageCircleMore />
              <span>방문 후기</span>
            </NavLink>
          </nav>

          <div className="flex p-4">
            <Button
              variants="secondary"
              className={cn(
                "flex h-14 w-full gap-2 font-pretendard text-xl",
                "hover:bg-red-600",
                "[&_svg]:size-6",
              )}
              onClick={handleLogOut}
            >
              <LogOut />
              <span>로그아웃</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SideNavigationManager };
