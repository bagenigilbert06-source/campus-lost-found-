import React from 'react';
import LatesItems from './LatesItems';
import Banner from './Banner';
import AskQu from './Askqu';
import Newsletter from './Newsletter';
import { Helmet } from 'react-helmet-async';
import Reviews from './Reviews';
import { schoolConfig } from '../../config/schoolConfig';

const Home = () => {
    return (
        <div className='min-h-screen'>
            <Helmet>
                <title>Home - {schoolConfig.name} Lost & Found</title>
            </Helmet>
           <section><Banner/></section>
           <section><LatesItems/></section>
           <section><Reviews/></section>
           <section><AskQu/></section>
           <section><Newsletter/></section>
        </div>
    );
};

export default Home;
