import { IBackendRes, IModelPaginate } from "@/types/api";
import { ChatRoomTagAssignment, Tag } from "@/types/model";

export type TagRequest = {
    name: string;
    color: string;
}
export type TagResponse = IBackendRes<Tag>

export type UpdateTagRequest = {
    tagId: number;
    name: string;
    color: string;
}

export type GetTagRequest = {
    page?: number;
    size?: number;
};
export type GetTagResponse = IBackendRes<IModelPaginate<Tag>>;

export type AssignmentTagRequest = {
    tagId: number;
    roomIds: number[];
}
export type AssignmentTagResponse = IBackendRes<ChatRoomTagAssignment[]>;

export type FetchRoomIdsByTagResponse = IBackendRes<number[]>;