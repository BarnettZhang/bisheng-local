import LabelShow from "@/components/bs-comp/cardComponent/LabelShow";
import SkillTempSheet from "@/components/bs-comp/sheets/SkillTempSheet";
import { bsConfirm } from "@/components/bs-ui/alertDialog/useConfirm";
import SelectSearch from "@/components/bs-ui/select/select";
import { useToast } from "@/components/bs-ui/toast/use-toast";
import { useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, NavLink } from "react-router-dom";
import CardComponent from "../../components/bs-comp/cardComponent";
import { MoveOneIcon } from "../../components/bs-icons/moveOne";
import { Button } from "../../components/bs-ui/button";
import { SearchInput } from "../../components/bs-ui/input";
import AutoPagination from "../../components/bs-ui/pagination/autoPagination";
import { userContext } from "../../contexts/userContext";
import { readTempsDatabase } from "../../controllers/API";
import { deleteFlowFromDatabase, readFlowsFromDatabase, saveFlowToDatabase, updataOnlineState } from "../../controllers/API/flow";
import { captureAndAlertRequestErrorHoc } from "../../controllers/request";
import { FlowType } from "../../types/flow";
import { useTable } from "../../util/hook";
import { generateUUID } from "../../utils";
import CardSelectVersion from "./components/CardSelectVersion";
import CreateTemp from "./components/CreateTemp";
import { useQueryLabels } from "./tabAssistant";

export default function Skills() {
    const { t } = useTranslation()
    const { user } = useContext(userContext);
    const { message } = useToast()
    const navigate = useNavigate()

    const { page, pageSize, data: dataSource, total, loading, setPage, search, reload, refreshData, filterData } = useTable<FlowType>({ pageSize: 14 }, (param) =>
        readFlowsFromDatabase(param.page, param.pageSize, param.keyword, param.tag_id)
    )

    const { open: tempOpen, flowRef, toggleTempModal } = useCreateTemp()

    // 上下线
    const handleCheckedChange = (checked, data) => {
        // data.versionId todo
        return captureAndAlertRequestErrorHoc(updataOnlineState(data.id, data, checked).then(res => {
            if (res) {
                refreshData((item) => item.id === data.id, { status: checked ? 2 : 1 })
            }
            return res
        }))
    }

    const handleDelete = (data) => {
        bsConfirm({
            desc: t('skills.confirmDeleteSkill'),
            okTxt: t('delete'),
            onOk(next) {
                captureAndAlertRequestErrorHoc(deleteFlowFromDatabase(data.id).then(reload));
                next()
            }
        })
    }

    const handleSetting = (data) => {
        // console.log('data :>> ', data);
        const vid = data.version_list.find(item => item.is_current === 1)?.id
        navigate(`/build/skill/${data.id}/${vid}`)
    }

    // 选模板(创建技能)
    const handldSelectTemp = async (tempId) => {
        const [flow] = await readTempsDatabase(tempId)

        flow.name = `${flow.name}-${generateUUID(5)}`
        // @ts-ignore
        captureAndAlertRequestErrorHoc(saveFlowToDatabase({ ...flow, id: flow.flow_id }).then((res: any) => {
            res.user_name = user.user_name
            res.write = true
            // setOpen(false)
            navigate(`/build/skill/${res.id}/${res.version_id}`)
        }))
    }

    const { selectLabel, setSelectLabel, setSearchKey, filteredOptions, allOptions, refetchLabels } = useQueryLabels(t)
    const handleLabelSearch = (id) => {
        setSelectLabel(allOptions.find(l => l.value === id))
        filterData({ tag_id: id })
    }

    return <div className="h-full relative">
        <div className="px-[32px] py-[16px] h-full overflow-y-scroll scrollbar-hide relative bg-[#F5F5F5]">
            <div className="build-assistant-tab flex justify-center h-[38px] bg-[#EEEEEE] mb-[18px] rounded-md items-center relative">
                <div className="my-[4px] ml-[4px] w-[33%]">
                    <NavLink to='/build/assist' className="group flex gap-2 justify-center items-center px-8 py-[5px] rounded-md navlink">
                        <span className="text-sm font-bold text-muted-foreground group-hover:text-primary dark:group-hover:text-[#fff]">{t('build.assistant')}</span>
                    </NavLink>
                </div>
                <div className="my-[4px] mx-[12px] w-[33%]">
                    <NavLink to='/build/skills' className="group flex gap-2 justify-center items-center px-8 py-[5px] rounded-md navlink">
                        <span className="text-sm font-bold text-muted-foreground group-hover:text-primary dark:group-hover:text-[#fff]">{t('build.skill')}</span>
                    </NavLink>
                </div>
                <div className="my-[4px] mr-[4px] w-[33%]">
                    <NavLink to='/build/tools' className="group flex gap-2 justify-center items-center px-8 py-[5px] rounded-md navlink">
                        <span className="text-sm font-bold text-muted-foreground group-hover:text-primary dark:group-hover:text-[#fff]">{t('build.tools')}</span>
                    </NavLink>
                </div>
            </div>
            <div className="flex space-x-4">
                <SearchInput className="w-64" placeholder={t('skills.skillSearch')} onChange={(e) => search(e.target.value)}></SearchInput>
                <SelectSearch value={!selectLabel.value ? '' : selectLabel.value} options={allOptions}
                    selectPlaceholder={t('chat.allLabels')}
                    inputPlaceholder={t('chat.searchLabels')}
                    selectClass="w-64"
                    onOpenChange={() => setSearchKey('')}
                    onChange={(e) => setSearchKey(e.target.value)}
                    onValueChange={handleLabelSearch}>
                </SelectSearch>
                {user.role === 'admin' && <Button
                    variant="ghost"
                    className="hover:bg-gray-50 flex gap-2 dark:hover:bg-[#34353A]"
                    onClick={() => navigate('/build/temps')}
                ><MoveOneIcon className="dark:text-slate-50" />{t('skills.manageTemplate')}</Button>}
            </div>
            {/* list */}
            {
                loading
                    ? <div className="absolute w-full h-full top-0 left-0 flex justify-center items-center z-10 bg-[rgba(255,255,255,0.6)] dark:bg-blur-shared">
                        <span className="loading loading-infinity loading-lg"></span>
                    </div>
                    : <div className="mt-6 flex gap-2 flex-wrap pb-20 min-w-[980px]">
                        <SkillTempSheet onSelect={handldSelectTemp}>
                            <CardComponent<FlowType>
                                data={null}
                                type='skill'
                                title={t('skills.createNew')}
                                description={(<>
                                    <p>{t('skills.executionSteps')}</p>
                                    <p>{t('skills.sceneTemplates')}</p>
                                </>)}
                            ></CardComponent>
                        </SkillTempSheet>
                        {
                            dataSource.map((item: any, i) => (
                                <CardComponent<FlowType>
                                    key={item.id}
                                    data={item}
                                    id={item.id}
                                    logo={item.logo}
                                    type='skill'
                                    edit={item.write}
                                    title={item.name}
                                    isAdmin={user.role === 'admin'}
                                    description={item.description}
                                    checked={item.status === 2}
                                    user={item.user_name}
                                    currentUser={user}
                                    onClick={() => handleSetting(item)}
                                    onSwitchClick={() => !item.write && item.status !== 2 && message({ title: t('prompt'), description: t('skills.contactAdmin'), variant: 'warning' })}
                                    onAddTemp={toggleTempModal}
                                    onCheckedChange={handleCheckedChange}
                                    onDelete={handleDelete}
                                    onSetting={(item) => handleSetting(item)}
                                    headSelecter={(
                                        <CardSelectVersion
                                            showPop={item.status !== 2}
                                            data={item}
                                        ></CardSelectVersion>
                                    )}
                                    labelPannel={
                                        <LabelShow
                                            data={item}
                                            user={user}
                                            type={'skill'}
                                            all={filteredOptions}
                                            onChange={refetchLabels}>
                                        </LabelShow>
                                    }
                                ></CardComponent>
                            ))
                        }
                    </div>
            }
        </div>
        {/* 添加模板 */}
        <CreateTemp flow={flowRef.current} open={tempOpen} setOpen={() => toggleTempModal()} onCreated={() => { }} ></CreateTemp>
        {/* footer */}
        <div className="flex justify-between absolute bottom-0 left-0 w-full bg-[#F5F5F5] h-16 items-center px-10">
            <p className="text-sm text-muted-foreground break-keep">{t('skills.manageProjects')}</p>
            <AutoPagination className="m-0 w-auto justify-end" page={page} pageSize={pageSize} total={total} onChange={setPage}></AutoPagination>
        </div>
    </div>
};

// 创建技能模板弹窗状态
const useCreateTemp = () => {
    const [open, setOpen] = useState(false)
    const flowRef = useRef(null)

    return {
        open,
        flowRef,
        toggleTempModal(flow?) {
            flowRef.current = flow || null
            setOpen(!open)
        }
    }
}
