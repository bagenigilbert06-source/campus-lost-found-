import React from 'react';
import Banner from './Banner';
import Features from './Features';
import HowItWorks from './HowItWorks';
import About from './About';
import Stats from './Stats';
import Reviews from './Reviews';
import Askqu from './Askqu';
import BottomCTA from './BottomCTA';
import Newsletter from './Newsletter';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const Home = () => {
    return (
        <div className='min-h-screen'>
            <Helmet>
                <title>{`Home - ${schoolConfig.name}`}</title>
                <meta name="description" content="Zetech Foundit - Find, report, and recover items easily on campus. Join our community to reunite with your belongings." />
            </Helmet>
            <section><Banner /></section>
            <section><Features /></section>
            <section><HowItWorks /></section>
            <section><About /></section>
            <section><Stats /></section>
            <section><Reviews /></section>
            <section><Askqu /></section>
            <section><BottomCTA /></section>
            <section><Newsletter /></section>
        </div>
    );
};

export default Home;
