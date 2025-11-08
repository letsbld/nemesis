'use client';
import React from 'react';
import { Commet } from 'react-loading-indicators';

const Loader = () => (
  <div className="flex justify-center py-12">
    <Commet color="#318bcc" size="medium" />
  </div>
);

export default Loader;
