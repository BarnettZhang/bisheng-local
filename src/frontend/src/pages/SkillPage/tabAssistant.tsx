import LabelShow from "@/components/bs-comp/cardComponent/LabelShow";
import { bsConfirm } from "@/components/bs-ui/alertDialog/useConfirm";
import DialogForceUpdate from "@/components/bs-ui/dialog/DialogForceUpdate";
import SelectSearch from "@/components/bs-ui/select/select";
import { useToast } from "@/components/bs-ui/toast/use-toast";
import { userContext } from "@/contexts/userContext";
import { getAllLabelsApi } from "@/controllers/API/label";
import { captureAndAlertRequestErrorHoc } from "@/controllers/request";
import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from 'react-query';
import { useNavigate, NavLink } from "react-router-dom";
import CardComponent from "../../components/bs-comp/cardComponent";
import { SearchInput } from "../../components/bs-ui/input";
import AutoPagination from "../../components/bs-ui/pagination/autoPagination";
import { AssistantItemDB, changeAssistantStatusApi, deleteAssistantApi, getAssistantsApi } from "../../controllers/API/assistant";
import { FlowType } from "../../types/flow";
import { useTable } from "../../util/hook";
import CreateAssistant from "./components/CreateAssistant";
import { TabIcon } from "@/components/bs-icons";

export default function Assistants() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { message } = useToast()
    const { user } = useContext(userContext)

    const { page, pageSize, data: dataSource, total, loading, setPage, search, reload, refreshData, filterData } = useTable<AssistantItemDB>({ pageSize: 15 }, (param) =>
        getAssistantsApi(param.page, param.pageSize, param.keyword, param.tag_id)
    )

    const handleDelete = (data) => {
        bsConfirm({
            desc: t('deleteAssistant'),
            okTxt: t('delete'),
            onOk(next) {
                deleteAssistantApi(data.id).then(() => reload())
                next()
            }
        })
    }

    const handleCheckedChange = (checked, data) => {
        return captureAndAlertRequestErrorHoc(changeAssistantStatusApi(data.id, checked ? 1 : 0)).then(res => {
            if (res === null) {
                refreshData((item) => item.id === data.id, { status: checked ? 1 : 0 })
            }
            return res
        })
    }

    const { selectLabel, setSelectLabel, setSearchKey, filteredOptions, allOptions, refetchLabels } = useQueryLabels(t)
    const handleLabelSearch = (id) => {
        setSelectLabel(allOptions.find(l => l.value === id))
        filterData({ tag_id: id })
    }

    return <div className="h-full relative bg-[#F5F5F5]">
        <div className="px-[32px] py-[16px] h-full overflow-y-scroll scrollbar-hide relative">
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
                <SearchInput className="w-64" placeholder={t('build.searchAssistant')} onChange={(e) => search(e.target.value)}></SearchInput>
                <SelectSearch value={!selectLabel.value ? '' : selectLabel.value} options={allOptions}
                    selectPlaceholder={t('chat.allLabels')}
                    inputPlaceholder={t('chat.searchLabels')}
                    selectClass="w-64"
                    onOpenChange={() => setSearchKey('')}
                    onChange={(e) => setSearchKey(e.target.value)}
                    onValueChange={handleLabelSearch}>
                </SelectSearch>
            </div>
            {/* list */}
            {
                loading
                    ? <div className="absolute w-full h-full top-0 left-0 flex justify-center items-center z-10 bg-[rgba(255,255,255,0.6)] dark:bg-blur-shared">
                        <span className="loading loading-infinity loading-lg"></span>
                    </div>
                    : <div className="mt-6 flex gap-2 flex-wrap pb-20 min-w-[980px]">
                        {/* 创建助手 */}
                        <DialogForceUpdate
                            trigger={
                                <CardComponent<FlowType>
                                    data={null}
                                    type='skill'
                                    title={t('build.createAssistant')}
                                    description={(<>
                                        <p>{t('build.createDescription')}</p>
                                        <p>{t('build.nextDescription')}</p>
                                    </>)}
                                    onClick={() => console.log('新建')}
                                ></CardComponent>
                            }>
                            <CreateAssistant ></CreateAssistant>
                        </DialogForceUpdate>
                        {
                            dataSource.map((item: any, i) => (
                                <CardComponent<AssistantItemDB>
                                    data={item}
                                    id={item.id}
                                    logo={item.logo}
                                    edit={item.write}
                                    checked={item.status === 1}
                                    type='assist'
                                    title={item.name}
                                    description={item.desc}
                                    user={item.user_name}
                                    currentUser={user}
                                    onClick={() => item.status !== 1 && navigate('/assistant/' + item.id)}
                                    onSwitchClick={() => !item.write && item.status !== 1 && message({ title: t('prompt'), description: t('skills.contactAdmin'), variant: 'warning' })}
                                    onDelete={handleDelete}
                                    onSetting={() => navigate('/assistant/' + item.id)}
                                    onCheckedChange={handleCheckedChange}
                                    labelPannel={
                                        <LabelShow
                                            data={item}
                                            user={user}
                                            type={'assist'}
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
        {/* footer */}
        <div className="flex justify-between absolute bottom-0 left-0 w-full bg-[#F5F5F5] h-16 items-center px-10">
            <p className="text-sm text-muted-foreground break-keep">{t('build.manageAssistant')}</p>
            <AutoPagination className="m-0 w-auto justify-end" page={page} pageSize={pageSize} total={total} onChange={setPage}></AutoPagination>
        </div>
    </div>
};


export const useQueryLabels = (t) => {
    const { data: options, refetch } = useQuery({
        queryKey: "QueryLabelsKey",
        queryFn: () => getAllLabelsApi().then(res =>
            res.data.map(d => ({ label: d.name, value: d.id, edit: false, selected: false }))
        )
    });

    const [searchKey, setSearchKey] = useState('');
    const [selectLabel, setSelectLabel] = useState({ label: '', value: null })

    const [filteredOptions, allOptions] = useMemo(() => {
        if (!options) return [[], []]
        const topItem = { label: t('all'), value: -1, edit: false, selected: false }
        if (!searchKey) return [options, [topItem, ...options]];
        // 检索
        const _newOptions = options.filter(op => op.label.toUpperCase().includes(searchKey.toUpperCase()) || op.value === selectLabel.value)
        return [_newOptions, [topItem, ..._newOptions]]
    }, [searchKey, options, selectLabel])

    return {
        selectLabel,
        setSelectLabel,
        setSearchKey,
        filteredOptions,
        allOptions,
        refetchLabels: refetch
    }
}