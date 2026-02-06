
import { useUserRoleContext } from "../contexts/UserRoleProvider";

export function useAccessControl() {
    return useUserRoleContext();
}

