import {
    ApplicationIcon,
    BookOpenIcon,
    EnIcon,
    EvaluatingIcon,
    GithubIcon,
    KnowledgeIcon,
    LabelIcon,
    LogIcon,
    ModelIcon,
    QuitIcon,
    SystemIcon,
    TechnologyIcon
} from "@/components/bs-icons";
import { bsConfirm } from "@/components/bs-ui/alertDialog/useConfirm";
import { SelectHover, SelectHoverItem } from "@/components/bs-ui/select/hover";
import { locationContext } from "@/contexts/locationContext";
import { CaretDownIcon, LockClosedIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import i18next from "i18next";
import { Globe } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import CrashErrorComponent from "../components/CrashErrorComponent";
import { Separator } from "../components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { darkContext } from "../contexts/darkContext";
import { userContext } from "../contexts/userContext";
import { logoutApi } from "../controllers/API/user";
import { captureAndAlertRequestErrorHoc } from "../controllers/request";
import { User } from "../types/api/user";
import HeaderMenu from "./HeaderMenu";
import { DatasetIcon } from "@/components/bs-icons/menu/dataset";

export default function MainLayout() {
    const { dark, setDark } = useContext(darkContext);
    const { appConfig } = useContext(locationContext)
    // 角色
    const { user, setUser } = useContext(userContext);
    const { language, options, changLanguage, t } = useLanguage(user)

    const handleLogout = () => {
        bsConfirm({
            title: `${t('prompt')}!`,
            desc: `${t('menu.logoutContent')}？`,
            okTxt: t('system.confirm'),
            onOk(next) {
                captureAndAlertRequestErrorHoc(logoutApi()).then(_ => {
                    setUser(null)
                    localStorage.removeItem('isLogin')
                })
                next()
            }
        })
    }

    // 重置密码
    const navigator = useNavigate()
    const JumpResetPage = () => {
        localStorage.setItem('account', user.user_name)
        navigator('/reset')
    }

    // 系统管理员(超管、组超管)
    const isAdmin = useMemo(() => {
        return ['admin', 'group_admin'].includes(user.role)
    }, [user])

    const isMenu = (menu) => {
        return user.web_menu.includes(menu) || user.role === 'admin'
    }

    return <div className="flex">
        <div className="bg-background-main w-full h-screen">
            <div className="flex justify-between h-[64px] bg-background-main relative z-[21] border-b">
                <div className="flex h-[30px] my-[14px]">
                    <Link className="inline-block" to="http://28.7.168.114" rel="noopener noreferrer">
                        {/* @ts-ignore */}
                        <img src={__APP_ENV__.BASE_URL + '/login-logo-small.svg'} className="w-[280px] h-[30px] ml-[20px] rounded dark:w-[104px]" alt="" />
                    </Link>
                </div>
                <div>
                    <HeaderMenu />
                </div>
                <div className="flex w-fit relative z-10">
                    <div className="flex items-center h-7 my-4">
                        {/* @ts-ignore */}
                        <img className="h-7 w-7 rounded-2xl mr-4" src={__APP_ENV__.BASE_URL + '/user.png'} alt="" />
                        <SelectHover
                            triagger={
                                <span className="leading-8 text-[14px] mr-8 max-w-40 cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap">
                                    {user.user_name} <CaretDownIcon className="inline-block mt-[-2px]" />
                                </span>
                            }>
                            <SelectHoverItem onClick={JumpResetPage}><LockClosedIcon className="w-4 h-4 mr-1" /><span>{t('menu.changePwd')}</span></SelectHoverItem>
                            <SelectHoverItem onClick={handleLogout}><QuitIcon className="w-4 h-4 mr-1" /><span>{t('menu.logout')}</span></SelectHoverItem>
                        </SelectHover>
                    </div>
                </div>
            </div>
            <div className="flex" style={{ height: "calc(100vh - 64px)" }}>
                <div className="relative z-10 bg-background-main h-full w-[240px] min-w-[240px] px-5 pt-5 shadow-x1 flex justify-between text-center border-r">
                    <nav className="">
                        <NavLink to='/' className={`navlink inline-flex rounded-[4px] w-full hover:bg-nav-hover h-[38px] mb-[12px]`}>
                            <span className="mx-[12px] max-w-[48px] text-[14px] leading-[38px]">{t('menu.app')}</span>
                        </NavLink>
                        {
                            isMenu('build') &&
                            <NavLink to='/build' className={`navlink inline-flex rounded-[4px] w-full hover:bg-nav-hover h-[38px] mb-[12px]`} >
                                <span className="mx-[12px] max-w-[48px] text-[14px] leading-[38px]">{t('menu.skills')}</span>
                            </NavLink>
                        }
                        {
                            isMenu('knowledge') &&
                            <NavLink to='/filelib' className={`navlink inline-flex rounded-[4px] w-full hover:bg-nav-hover h-[38px] mb-[12px]`}>
                                <span className="mx-[12px] max-w-[48px] text-[14px] leading-[38px]">{t('menu.knowledge')}</span>
                            </NavLink>
                        }
                        {
                            user.role === 'admin' && <>
                                <NavLink to='/dataset' className={`navlink inline-flex rounded-[4px] w-full hover:bg-nav-hover h-[38px] mb-[12px]`}>
                                    <span className="mx-[12px] max-w-[48px] text-[14px] leading-[38px]">{t('menu.dataset')}</span>
                                </NavLink>
                            </>
                        }
                        {
                            isMenu('model') &&
                            <NavLink to='/model' className={`navlink inline-flex rounded-[4px] w-full hover:bg-nav-hover h-[38px] mb-[12px]`}>
                                <span className="mx-[12px] max-w-[48px] text-[14px] leading-[38px]">{t('menu.models')}</span>
                            </NavLink>
                        }
                        {
                            isMenu('evaluation') &&
                            <NavLink to='/evaluation' className={`navlink inline-flex rounded-[4px] w-full hover:bg-nav-hover h-[38px] mb-[12px]`}>
                                <span className="mx-[12px] max-w-[48px] text-[14px] leading-[38px]">{t('menu.evaluation')}</span>
                            </NavLink>
                        }
                        {
                            <NavLink to='/label' className={`navlink inline-flex rounded-[4px] w-full hover:bg-nav-hover h-[38px] mb-[12px]`}>
                                <span className="mx-[12px] max-w-[48px] text-[14px] leading-[38px]">标注</span>
                            </NavLink>
                        }
                        {
                            isAdmin && <>
                                <NavLink to='/log' className={`navlink inline-flex rounded-[4px] w-full hover:bg-nav-hover h-[38px] mb-[12px]`}>
                                    <span className="mx-[12px] max-w-[48px] text-[14px] leading-[38px]">{t('menu.log')}</span>
                                </NavLink>
                            </>
                        }
                        {
                            isAdmin && <>
                                <NavLink to='/sys' className={`navlink inline-flex rounded-[4px] w-full hover:bg-nav-hover h-[38px] mb-[12px]`}>
                                    <span className="mx-[12px] max-w-[48px] text-[14px] leading-[38px]">{t('menu.system')}</span>
                                </NavLink>
                            </>
                        }
                    </nav>
                </div>
                <div className="flex-1 bg-background-main-content rounded-[4px] w-[calc(100vw-184px)]">
                    <ErrorBoundary
                        onReset={() => window.location.href = window.location.href}
                        FallbackComponent={CrashErrorComponent}
                    >
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </div>
        </div>

        {/* // mobile */}
        <div className="fixed w-full h-full top-0 left-0 bg-[rgba(0,0,0,0.4)] sm:hidden text-sm z-50">
            <div className="w-10/12 bg-gray-50 mx-auto mt-[30%] rounded-xl px-4 py-10">
                <p className=" text-sm text-center">{t('menu.forBestExperience')}</p>
                {
                    !appConfig.isPro && <div className="flex mt-8 justify-center gap-4">
                        <a href={"https://github.com/dataelement/bisheng"} target="_blank">
                            <GithubIcon className="side-bar-button-size mx-auto" />Github
                        </a>
                        <a href={"https://m7a7tqsztt.feishu.cn/wiki/ZxW6wZyAJicX4WkG0NqcWsbynde"} target="_blank">
                            <BookOpenIcon className="side-bar-button-size mx-auto" /> {t('menu.onlineDocumentation')}
                        </a>
                    </div>
                }
            </div>
        </div>
    </div >
};

const useLanguage = (user: User) => {
    const [language, setLanguage] = useState('zh')
    useEffect(() => {
        const lang = user.user_id ? localStorage.getItem('language-' + user.user_id) : null
        if (lang) {
            setLanguage(lang)
        }
    }, [user])

    const { t } = useTranslation()
    const changLanguage = () => {
        const ln = language === 'zh' ? 'en' : 'zh'
        setLanguage(ln)
        localStorage.setItem('language-' + user.user_id, ln)
        localStorage.setItem('language', ln)
        i18next.changeLanguage(ln)
    }
    return {
        language,
        options: { en: '使用中文', zh: 'English' },
        changLanguage,
        t
    }
}