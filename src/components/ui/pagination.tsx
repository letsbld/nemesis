'use client';


import React from 'react';
import { Pagination as FlowPagination } from 'flowbite-react';


interface Props {
currentPage: number;
totalItems: number;
pageSize: number;
onPageChange: (page: number) => void;
}


export default function Pagination({ currentPage, totalItems, pageSize, onPageChange }: Props) {
const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));


return (
<div>
<FlowPagination currentPage={currentPage} onPageChange={(p) => onPageChange(p)} showIcons totalPages={totalPages} />
</div>
);
}