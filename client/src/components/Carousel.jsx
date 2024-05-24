import { Swiper, SwiperSlide } from 'swiper/react';
import slide1 from '../assets/images/carousel1.jpg'
import slide2 from '../assets/images/carousel2.jpg'
import slide3 from '../assets/images/carousel3.jpg'
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Slide from './Slide';

const Carousel = () => {
    return (
        <div className='py-5 container mx-auto'>
            <>
                <Swiper
                    spaceBetween={30}
                    centeredSlides={true}
                    loop={true}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}
                    className="mySwiper"
                >
                    <SwiperSlide><Slide image={slide1} text="Holisticly morph top-line vortals after excellent outside the box thinking" /></SwiperSlide>

                    <SwiperSlide><Slide image={slide2} text="Holisticly morph top-line vortals after excellent outside the box thinking" /></SwiperSlide>

                    <SwiperSlide><Slide image={slide3} text="Holisticly morph top-line vortals after excellent outside the box thinking" /></SwiperSlide>
                </Swiper>
            </>
        </div>
    );
};

export default Carousel;