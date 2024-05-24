import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import JobCard from './JobCard';
import { useEffect, useState } from 'react';
import axios from 'axios';

const JobTabs = () => {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const getData = async () => {
            const { data } = await axios(`${import.meta.env.VITE_API_URL}/jobs`)
            setJobs(data)
        }
        getData();
    }, [])


    return (
        <div className='container mx-auto my-16'>
            <div>
                <Tabs>
                    <div className='flex justify-center items-center'>
                        <TabList>
                            <Tab>Web Development</Tab>
                            <Tab>Graphics Design</Tab>
                            <Tab>Digital Marketing</Tab>
                        </TabList>
                    </div>

                    <TabPanel>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
                        gap-6'>
                            {
                                jobs
                                    .filter(j => j.category === 'Web Development')
                                    .map(job => <JobCard key={job._id} job={job}></JobCard>)

                            }
                        </div>
                    </TabPanel>
                    <TabPanel>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                        gap-6'>
                            {
                                jobs
                                    .filter(j => j.category === 'Graphics Design')
                                    .map(job => <JobCard key={job._id} job={job}></JobCard>)

                            }
                        </div>
                    </TabPanel>
                    <TabPanel>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                        gap-6'>
                            {
                                jobs
                                    .filter(j => j.category === 'Digital Marketing')
                                    .map(job => <JobCard key={job._id} job={job}></JobCard>)

                            }
                        </div>
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    );
};

export default JobTabs;