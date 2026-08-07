import React from 'react';
import Header from '../../../components/user/Header/Header';
import Banner from '../../../components/user/Banner/Banner';
import Categories from '../../../components/user/Categories/Categories';
import Quality from '../../../components/user/Quality/Quality';
import JoinUs from '../../../components/user/JoinUs/JoinUs';
import Reviews from '../../../components/user/Reviews/Reviews';
import Footer from '../../../components/user/Footer/Footer';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <Header />
      <Banner />
      <Categories />
      <Quality />
      <JoinUs />
      <Reviews />
      <Footer />
    </div>
  );
}

