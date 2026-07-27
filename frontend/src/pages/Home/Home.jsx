import React from 'react';
import Header from '../../components/Header/Header';
import Banner from '../../components/Banner/Banner';
import Categories from '../../components/Categories/Categories';
import Quality from '../../components/Quality/Quality';
import JoinUs from '../../components/JoinUs/JoinUs';
import Reviews from '../../components/Reviews/Reviews';
import Footer from '../../components/Footer/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <Banner />
      <Categories />
      <Quality />
      <JoinUs />
      <Reviews />
      <Footer />
    </>
  );
}
