/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import {
  AlertCircle,
  Bell,
  Bookmark,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Folder,
  Headset,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  NotebookPen,
  PauseCircle,
  Pencil,
  Search,
  Settings,
  Trash2,
  UserRoundCheck,
  Users,
  Video,
} from "lucide-react";
import { IoMdCloudUpload } from "react-icons/io";
import { MdOutlineFileUpload } from "react-icons/md";
import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarRightCollapseFilled,
  TbMessageUser,
} from "react-icons/tb";

/**
 * Icons Registry
 *
 * This file centralizes all icons used in the application.
 * Only icons that are actively used are maintained here to keep the bundle size small.
 */
import { BsLockFill } from "react-icons/bs";
import { FaBookmark, FaReceipt, FaTrashCan } from "react-icons/fa6";
import { FaShoppingCart, FaBoxOpen, FaTags, FaUsersCog } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";
import {
  HiCheckBadge,
  HiClipboardDocumentList,
  HiNewspaper,
} from "react-icons/hi2";
import { ImExit } from "react-icons/im";
import { IoSettingsSharp, IoWallet } from "react-icons/io5";
import { MdOutlineClose } from "react-icons/md";
import { PiCrownSimpleFill, PiCubeFocusLight } from "react-icons/pi";
import {
  RiExchangeDollarLine,
  RiShieldStarFill,
  RiUserForbidLine,
} from "react-icons/ri";
import {
  TbBellRingingFilled,
  TbLayoutDashboardFilled,
  TbUserCircle,
  TbUserDollar,
} from "react-icons/tb";

export const Icons = {
  // Navigation & Core UI
  LayoutDashboard,
  TbLayoutDashboardFilled,
  RiExchangeDollarLine,
  FaTrashCan,
  MdOutlineClose,
  BsLockFill,
  RiShieldStarFill,
  HiCheckBadge,
  RiUserForbidLine,
  UserRoundCheck,
  PiCubeFocusLight,
  TbUserCircle,
  FaReceipt,
  TbUserDollar,
  ImExit,
  FaBookmark,
  FaShoppingCart,
  FaBoxOpen,
  FaTags,
  FaUsersCog,
  TbBellRingingFilled,
  HiClipboardDocumentList,
  PiCrownSimpleFill,
  Users,
  IoWallet,
  HiNewspaper,
  IoSettingsSharp,
  HiUserGroup,
  MapPin,
  Pencil,
  Mail,
  Bookmark,
  Trash2,
  Building2,
  CreditCard,
  Eye,
  EyeOff,
  Folder,
  Headset,
  NotebookPen,
  ClipboardList,
  Video,
  MessageSquare: TbMessageUser,
  Settings,
  Search,
  LogOut,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Calendar,

  // Sidebar controls
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarRightCollapseFilled,

  // Action icons
  IoMdCloudUpload,
  MdOutlineFileUpload,

  CheckCircle,
  PauseCircle,
  AlertCircle,

  // Custom image icons
  CustomTotalIcon: ({ className }: any) => (
    <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <Image draggable={false} src="/dashboard/Total.png" alt="icon" fill className="object-contain" />
    </div>
  ),
  CustomVectorIcon: ({ className }: any) => (
    <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <Image draggable={false} src="/dashboard/Vector.png" alt="icon" fill className="object-contain" />
    </div>
  ),
  CustomHoldIcon: ({ className }: any) => (
    <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <Image draggable={false} src="/dashboard/hold.png" alt="icon" fill className="object-contain" />
    </div>
  ),
  CustomActionsIcon: ({ className }: any) => (
    <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <Image draggable={false} src="/dashboard/actions.png" alt="icon" fill className="object-contain" />
    </div>
  ),
};
