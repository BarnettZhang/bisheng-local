import CardComponent from "@/components/bs-comp/cardComponent";
import LoadMore from "@/components/bs-comp/loadMore";
import { AssistantIcon, SettingIcon, SkillIcon } from "@/components/bs-icons";
import { Badge } from "@/components/bs-ui/badge";
import { Button } from "@/components/bs-ui/button";
import { SearchInput } from "@/components/bs-ui/input";
import { userContext } from "@/contexts/userContext";
import { getChatOnlineApi } from "@/controllers/API/assistant";
import { getHomeLabelApi } from "@/controllers/API/label";
import { useDebounce } from "@/util/hook";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MarkLabel from "./MarkLabel";

export default function HomePage({ onSelect }) {
    const { t } = useTranslation()
    const { user } = useContext(userContext)
    const chatListRef = useRef([])
    const navigate = useNavigate()

    const [labels, setLabels] = useState([])
    const [open, setOpen] = useState(false)
    const pageRef = useRef(1)
    const [options, setOptions] = useState([])
    const searchRef = useRef('')
    const [flag, setFlag] = useState(null) // 解决筛选之后再次发起请求覆盖筛选数据

    const loadData = (more = false) => {
        getChatOnlineApi(pageRef.current, searchRef.current, -1).then((res: any) => {
            setFlag(true)
            chatListRef.current = res
            setOptions(more ? [...options, ...res] : res)
        })
    }
    useEffect(() => {
        debounceLoad()
        getHomeLabelApi().then((res: any) => {
            setLabels(res.map(d => ({ label: d.name, value: d.id, selected: true })))
        })
    }, [])

    const debounceLoad = useDebounce(loadData, 600, false)

    const handleSearch = (e) => {
        pageRef.current = 1
        searchRef.current = e.target.value
        debounceLoad()
    }

    const handleClose = async (bool) => {
        const newHome = await getHomeLabelApi()
        // @ts-ignore
        setLabels(newHome.map(d => ({ label: d.name, value: d.id, selected: true })))
        setOpen(bool)
    }

    const [chooseId, setChooseId] = useState() // 筛选项样式变化
    const handleTagSearch = (id) => {
        setChooseId(id)
        setFlag(false)
        pageRef.current = 1
        getChatOnlineApi(pageRef.current, '', id).then((res: any) => {
            setOptions(res)
        })
    }

    const handleLoadMore = async () => {
        pageRef.current++
        await debounceLoad(true)
    }

    // const [cardBoxWidth, cardboxRef] = useAutoWidth()
    {/* @ts-ignore */ }
    return <div className="h-full overflow-hidden bs-chat-bg">
        <div className="flex flex-col justify-center items-center h-[200px] w-full">
            {/* @ts-ignore */}
            <div className="flex justify-center gap-[12px]" >
              <div className="text-[40px] leading-[56px]">你好</div>
              <img src={__APP_ENV__.BASE_URL + '/wave.svg'} className="w-[55px] h-[55px]" alt="" />
            </div>
            <p className="text-2xl leading-[50px] dark:text-[#D4D4D4]">
                选择一个对话，开始智能办公吧
            </p>
        </div>
        <div className="flex justify-center">
            <SearchInput onChange={handleSearch}
                placeholder={t('chat.searchAssistantOrSkill')}
                className="w-[600px] min-w-[300px] mt-[10px]" />
        </div>
        <div className="mt-[20px] px-[24px]">
            <div className="flex flex-wrap">
                <Button variant={chooseId ? "outline" : "default"} className="mb-2 mr-4 h-7" size="sm"
                    onClick={() => { setChooseId(null); loadData(false) }}>{t('all')}</Button>
                {
                    labels.map((l, index) => index <= 11 && <Button
                        size="sm"
                        onClick={() => handleTagSearch(l.value)}
                        className="mr-3 mb-2 h-7" variant={l.value === chooseId ? "default" : "outline"}>{l.label}
                    </Button>)
                }
                {/* @ts-ignore */}
                {user.role === 'admin' && <SettingIcon onClick={() => setOpen(true)} className="h-[30px] w-[30px] cursor-pointer" />}
            </div>
        </div>
        <div className="relative overflow-y-auto h-[calc(100vh-367px)]">
            <div className="flex flex-wrap gap-2 p-[16px] scrollbar-hide" >
                {
                    options.length ? options.map((flow, i) => (
                        <CardComponent key={i}
                            id={i + 1}
                            data={flow}
                            logo={flow.logo}
                            title={flow.name}
                            description={flow.desc}
                            type="sheet"
                            icon={flow.flow_type === 'flow' ? SkillIcon : AssistantIcon}
                            footer={
                                <Badge className={`absolute right-0 bottom-0 rounded-none rounded-br-md ${flow.flow_type === 'flow' && 'bg-gray-950'}`}>
                                    {flow.flow_type === 'flow' ? t('build.skill') : t('build.assistant')}
                                </Badge>
                            }
                            onClick={() => { onSelect(flow) }}
                        />
                    )) : <div className="absolute top-1/2 left-1/2 transform text-center -translate-x-1/2 -translate-y-1/2">
                        <p className="text-sm text-muted-foreground mb-3">{t('build.empty')}</p>
                        <Button className="w-[200px]" onClick={() => navigate('/build/assist')}>{t('build.onlineSA')}</Button>
                    </div>
                }
                {flag && <LoadMore onScrollLoad={handleLoadMore} />}
            </div>
        </div>
        <MarkLabel open={open} home={labels} onClose={handleClose}></MarkLabel>
    </div>
}


const useAutoWidth = () => {
    const [width, setWidth] = useState(0);
    const cardboxRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const resize = () => {
            // console.log('cardboxRef.current.width :>> ', cardboxRef.current.offsetWidth);
            setWidth(Math.floor(cardboxRef.current.offsetWidth / 323) * 323)
        }
        if (cardboxRef.current) {
            window.addEventListener('resize', resize)
            resize()
        }

        return () => {
            window.removeEventListener('resize', resize)
        }
    }, []);
    return [width, cardboxRef];

}