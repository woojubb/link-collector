import express from "express";
import { deleteLinkInfo, getLinkInfo, getLinkInfos, saveLink } from "../../../../../common/utils/link";
import { deleteDocument } from "../../../../../common/utils/elasticsearch";
const router = express.Router();

router.post('/', async (req, res) => {
    const {url, type} = req.body;

    const responseSaveLink = await saveLink(url, type);
    const response = responseSaveLink?._id !== null;

    res.json({ response });
});

router.delete('/', async (req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8')
    const {url} = req.body;
    const info = await getLinkInfo({ "alias.url": url });
    if (info) {
        const responseDeletelinkInfo = await deleteLinkInfo({ _id: info._id });
        const {elasticsearch} = res._context;
        const responseDeleteDocument = await deleteDocument({
            elasticsearch,
            id: info.search_index_id
        });

        return res.json({ response: {linkInfo: responseDeletelinkInfo, deleteDocument: responseDeleteDocument} });
    }

    return res.json({ response: false });
});

router.get('/', async (req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8')
    const {url} = req.query;
    const filterQuery = url ? {alias: {$elemMatch: {url}}} : null;
    const links = await getLinkInfos({filterQuery});
    const response = {links};
    res.json({ response });
});

router.get('/:id', async (req, res) => {
    res.header('Content-Type', 'application/json; charset=utf-8')
    const {id} = req.params;
    const filterQuery = id ? {_id: id} : null;
    const links = await getLinkInfos({filterQuery});
    const response = {links};
    res.json({ response });
});

export default router;