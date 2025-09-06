
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import AppHeader from "@/components/app-header";
import DrawingCanvas from "@/components/drawing-canvas";
import PollPanel from "@/components/poll-panel";
import ScreenShareView from "@/components/screen-share-view";
import { useToast } from "@/hooks/use-toast";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Video, Edit3, Vote, ScreenShare, Mic, MicOff, VideoOff, Users, LayoutGrid, UserSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ViewMode = "video" | "draw" | "share";
type VideoLayout = "speaker" | "grid";
type ImageFit = "cover" | "contain";

type Participant = {
  id: number;
  name: string;
  image: string;
  isMicOn: boolean;
  isVideoOn: boolean;
};

const participantNames = [
    "Aadhya Sharma", "Aarav Sharma", "Aarohi Singh", "Advait Singh", "Ananya Iyer", "Arjun Iyer", "Aishwarya Reddy", "Aman Reddy", "Amrita Nair", "Anirudh Nair", "Avni Choudhary", "Aryan Choudhary", 
    "Bhavya Desai", "Bhavesh Desai", "Charvi Patel", "Chaitanya Patel", "Diya Mehta", "Dev Mehta", "Divya Rajput", "Dhruv Rajput", "Ekta Goyal", "Eshan Goyal", "Ishika Malhotra", "Ishaan Malhotra", 
    "Jyoti Gupta", "Jay Gupta", "Kavya Menon", "Kunal Menon", "Meera Joshi", "Mihir Joshi", "Nandini Agarwal", "Nikhil Agarwal", "Radhika Bansal", "Rohan Bansal", "Sakshi Rathore", "Siddharth Rathore", 
    "Shreya Verma", "Tanish Verma", "Tanvi Pillai", "Varun Pillai", "Anika Kulkarni", "Abhishek Kulkarni", "Sneha Jadhav", "Saurabh Jadhav", "Sanya Shetty", "Karthik Shetty", "Kritika Pawar", "Pranav Pawar", 
    "Harini Krishna", "Aditya Krishna", "Pooja Sharma", "Manish Sharma", "Ritu Singh", "Vivek Singh", "Swati Iyer", "Harsh Iyer", "Neha Reddy", "Rohit Reddy", "Shraddha Nair", "Sameer Nair", "Ishani Choudhary", 
    "Umar Choudhary", "Aarti Desai", "Parth Desai", "Kiran Patel", "Umesh Patel", "Monika Mehta", "Nitin Mehta", "Varsha Rajput", "Rajeev Rajput", "Lavanya Goyal", "Sagar Goyal", "Smita Malhotra", "Tejas Malhotra", 
    "Vandana Gupta", "Vijay Gupta", "Reshma Menon", "Ajay Menon", "Reema Joshi", "Anil Joshi", "Aparna Agarwal", "Pankaj Agarwal", "Trisha Bansal", "Nitesh Bansal", "Payal Rathore", "Suraj Rathore", "Apeksha Verma", 
    "Mohit Verma", "Dipali Pillai", "Yogesh Pillai", "Pallavi Kulkarni", "Sunil Kulkarni", "Suchitra Jadhav", "Rajesh Jadhav", "Harshita Shetty", "Arvind Shetty", "Mala Pawar", "Akash Pawar", "Vidya Krishna", 
    "Lakshman Krishna", "Sonali Sharma", "Ramesh Sharma", "Gauri Singh", "Deepak Singh", "Prerna Iyer", "Naveen Iyer", "Shalini Reddy", "Sanjay Reddy", "Bhavana Nair", "Ashok Nair", "Anushka Choudhary", "Shubham Choudhary", 
    "Malika Desai", "Mahesh Desai", "Chhavi Patel", "Vinay Patel", "Jaya Mehta", "Ankit Mehta", "Savita Rajput", "Girish Rajput", "Simran Goyal", "Kapil Goyal", "Nisha Malhotra", "Omkar Malhotra", "Kusum Gupta", "Raj Gupta", 
    "Kamini Menon", "Arun Menon", "Sudha Joshi", "Shankar Joshi", "Harsha Agarwal", "Hemant Agarwal", "Manasi Bansal", "Alok Bansal", "Usha Rathore", "Bhuvan Rathore", "Renu Verma", "Piyush Verma", "Sonam Pillai", 
    "Rajat Pillai", "Bharti Kulkarni", "Sandeep Kulkarni", "Shweta Jadhav", "Ganesh Jadhav", "Hemlata Shetty", "Om Shetty", "Rekha Pawar", "Bharat Pawar", "Anvi Krishna", "Harendra Krishna", "Mridula Sharma", "Yash Sharma", 
    "Tanya Singh", "Amanat Singh", "Megha Iyer", "Devansh Iyer", "Namrata Reddy", "Kabir Reddy", "Veena Nair", "Farhan Nair", "Yamini Choudhary", "Imran Choudhary", "Ketaki Desai", "Ayaan Desai", "Preeti Patel", 
    "Chetan Patel", "Radha Mehta", "Rakesh Mehta", "Alka Rajput", "Jitendra Rajput", "Asha Goyal", "Arman Goyal", "Rupali Malhotra", "Samar Malhotra", "Priya Gupta", "Dharmesh Gupta", "Seema Menon", "Balaji Menon", 
    "Anita Joshi", "Kishore Joshi", "Smruti Agarwal", "Ashwin Agarwal", "Gayatri Bansal", "Danish Bansal", "Kalyani Rathore", "Faisal Rathore", "Nargis Verma", "Hanuman Verma", "Vandita Pillai", "Kartik Pillai", 
    "Shruti Kulkarni", "Vikas Kulkarni", "Padmini Jadhav", "Tanmay Jadhav", "Madhavi Shetty", "Lucky Shetty", "Lata Pawar", "Jeet Pawar", "Jhanvi Krishna", "Raghav Krishna", "Bhavna Sharma", "Mukesh Sharma", 
    "Aaradhya Singh", "Sohail Singh", "Sanjana Iyer", "Bhushan Iyer", "Nikita Reddy", "Raghu Reddy", "Roshni Nair", "Veeresh Nair", "Khushi Choudhary", "Adnan Choudhary", "Geeta Desai", "Jaideep Desai", "Muskaan Patel", 
    "Paresh Patel", "Snehal Mehta", "Krishna Mehta", "Sakina Rajput", "Shreyas Rajput", "Aalisha Goyal", "Puneet Goyal", "Nivedita Malhotra", "Shaan Malhotra", "Neelam Gupta", "Harish Gupta", "Sunita Menon", "Sumanth Menon", 
    "Reena Joshi", "Rakesh Joshi", "Tanisha Agarwal", "Manjunath Agarwal", "Deepika Bansal", "Ritvik Bansal", "Hema Rathore", "Anwar Rathore", "Juhi Verma", "Imtiaz Verma", "Kajal Pillai", "Amanullah Pillai", "Madhura Kulkarni", 
    "Vishal Kulkarni", "Ayesha Jadhav", "Mohan Jadhav", "Noor Shetty", "Nishant Shetty", "Sana Pawar", "Mitesh Pawar", "Taruna Krishna", "Jai Krishna", "Karishma Sharma", "Saket Sharma", "Ankita Singh", "Balram Singh", 
    "Bhagyashree Iyer", "Rituraj Iyer", "Rekha Reddy", "Sufyan Reddy", "Sarika Nair", "Hamza Nair", "Ambika Choudhary", "Salman Choudhary", "Pushpa Desai", "Darshan Desai", "Kriti Patel", "Gopal Patel", "Manisha Mehta", 
    "Nilesh Mehta", "Sonya Rajput", "Ashraf Rajput", "Pallavi Goyal", "Omprakash Goyal", "Anjuli Malhotra", "Vipul Malhotra", "Charul Gupta", "Prashanth Gupta", "Richa Menon", "Nandan Menon", "Vishakha Joshi", "Rajan Joshi", 
    "Kshama Agarwal", "Shafi Agarwal", "Dimple Bansal", "Kailash Bansal", "Monica Rathore", "Sanjeev Rathore", "Aarushi Verma", "Rameshwar Verma", "Parul Pillai", "Nadeem Pillai", "Shubha Kulkarni", "Govind Kulkarni", 
    "Bhairavi Jadhav", "Ranveer Jadhav", "Sugandha Shetty", "Milan Shetty", "Arpita Pawar", "Amar Pawar", "Ritika Krishna", "Shantanu Krishna", "Jagruti Sharma", "Jaspreet Sharma", "Harleen Singh", "Gurpreet Singh", 
    "Rupal Iyer", "Angad Iyer", "Pratibha Reddy", "Afzal Reddy", "Madhavi Nair", "Arbaaz Nair", "Nirmala Choudhary", "Sharad Choudhary", "Vandita Desai", "Bhargav Desai", "Kamala Patel", "Jignesh Patel", "Anjali Mehta", 
    "Rahul Mehta", "Mrunal Rajput", "Dilip Rajput", "Poorva Goyal", "Shailesh Goyal", "Snehalata Malhotra", "Rajnish Malhotra", "Deepali Gupta", "Ajmal Gupta", "Ahlam Menon", "Raman Menon", "Yamika Joshi", "Darshan Joshi", 
    "Saumya Agarwal", "Swapnil Agarwal", "Chaitali Bansal", "Zakir Bansal", "Kumud Rathore", "Anup Rathore", "Purnima Verma", "Rafiq Verma", "Nidhi Pillai", "Basavaraj Pillai", "Radhika Kulkarni", "Vinod Kulkarni", 
    "Lavina Jadhav", "Mahadev Jadhav", "Maitri Shetty", "Parvez Shetty", "Hiral Pawar", "Rajiv Pawar", "Avantika Krishna", "Shivendra Krishna", "Tajinder Sharma", "Arjit Sharma", "Gunjan Singh", "Lakshay Singh", "Krupa Iyer", 
    "Mayank Iyer", "Pranjali Reddy", "Salman Reddy", "Haritha Nair", "Moin Nair", "Devika Choudhary", "Aftab Choudhary", "Shibani Desai", "Lalit Desai", "Leena Patel", "Bharat Patel", "Sejal Mehta", "Pradeep Mehta", 
    "Madhuri Rajput", "Satyam Rajput", "Amisha Goyal", "Haroon Goyal", "Aakriti Malhotra", "Anmol Malhotra", "Falak Gupta", "Narendra Gupta", "Medha Menon", "Mohd. Irfan Menon", "Latika Joshi", "Harshit Joshi", 
    "Amruta Agarwal", "Indrajit Agarwal", "Vinita Bansal", "Nirmal Bansal", "Akriti Rathore", "Arif Rathore", "Stuti Verma", "Wahid Verma", "Dhara Pillai", "Ravi Pillai", "Nandita Kulkarni", "Vikrant Kulkarni", 
    "Malini Jadhav", "Satyajeet Jadhav", "Manjari Shetty", "Hiren Shetty", "Ojaswini Pawar", "Sameep Pawar", "Supriya Krishna", "Adarsh Krishna", "Shilpa Sharma", "Shivam Sharma", "Ayesha Singh", "Aman Singh", "Hetal Iyer", 
    "Ishwar Iyer", "Bharti Reddy", "Khalid Reddy", "Meenal Nair", "Zubair Nair", "Surabhi Choudhary", "Maqsood Choudhary", "Shuchi Desai", "Rituraj Desai", "Urvashi Patel", "Bhupendra Patel", "Roma Mehta", "Prakash Mehta", 
    "Priyanka Rajput", "Rakesh Rajput", "Sheetal Goyal", "Niraj Goyal", "Namita Malhotra", "Atul Malhotra", "Archana Gupta", "Aadil Gupta", "Sushma Menon", "Brijesh Menon", "Tanmaya Joshi", "Madhav Joshi", "Charuta Agarwal", 
    "Himanshu Agarwal", "Monica Bansal", "Pawan Bansal", "Madhusha Rathore", "Noman Rathore", "Amita Verma", "Amarendra Verma", "Swara Pillai", "Rakesh Pillai", "Maya Kulkarni", "Shyamal Kulkarni", "Neelofar Jadhav", "Amarjeet Jadhav", 
    "Ishrat Shetty", "Rohail Shetty", "Reshma Pawar", "Sahil Pawar", "Rupashree Krishna", "Chiranjeev Krishna", "Vaishnavi Sharma", "Harinder Sharma", "Janhavi Singh", "Shivraj Singh", "Ketaki Iyer", "Ashwath Iyer", "Rituparna Reddy", 
    "Iqbal Reddy", "Kajri Nair", "Sarfaraz Nair", "Radhiya Choudhary", "Rizwan Choudhary", "Lopa Desai", "Nandkishore Desai", "Shruti Patel", "Ashwin Patel", "Poonam Mehta", "Krunal Mehta", "Prachi Rajput", "Ansh Rajput", 
    "Seher Goyal", "Vishnu Goyal", "Shruthi Malhotra", "Lokesh Malhotra", "Aakanksha Gupta", "Rasik Gupta", "Kshama Menon", "Shravan Menon", "Amreen Joshi", "Surya Joshi", "Shagufta Agarwal", "Sunil Agarwal", "Noorjahan Bansal", 
    "Mahesh Bansal", "Nahid Rathore", "Lokendra Rathore", "Sitara Verma", "Tayyab Verma", "Almas Pillai", "Mustafa Pillai", "Mahima Kulkarni", "Sreekant Kulkarni", "Sumedha Jadhav", "Amrit Jadhav", "Padma Shetty", "Salman Shetty",
    "Aaruni Pawar", "Divyansh Pawar", "Aanchal Krishna", "Chinmay Krishna", "Navya Sharma", "Ankur Sharma", "Ira Singh", "Tushar Singh", "Ahana Iyer", "Harith Iyer", "Nitya Reddy", "Danish Reddy", "Anvi Nair", "Roshan Nair", 
    "Kriti Choudhary", "Arshad Choudhary", "Sejal Desai", "Rupesh Desai", "Diya Patel", "Hemant Patel", "Charita Mehta", "Rajiv Mehta", "Oviya Rajput", "Ravindra Rajput", "Amna Goyal", "Praveen Goyal", "Snehal Malhotra", 
    "Om Malhotra", "Kushi Gupta", "Alok Gupta", "Shanaya Menon", "Santosh Menon", "Aaratrika Joshi", "Sandeep Joshi", "Bhoomi Agarwal", "Dhiraj Agarwal", "Eesha Bansal", "Jatin Bansal", "Ishwari Rathore", "Rituraj Rathore", 
    "Muskaan Verma", "Sunny Verma", "Aahana Pillai", "Vignesh Pillai", "Sonika Kulkarni", "Ujjwal Kulkarni", "Sanvi Jadhav", "Vishal Jadhav", "Aradhya Shetty", "Ramesh Shetty", "Keya Pawar", "Karthikey Pawar", "Shradha Krishna", 
    "Vineet Krishna", "Aayushi Sharma", "Mihir Sharma", "Lavina Singh", "Prithviraj Singh", "Nyra Iyer", "Kiran Iyer", "Shifali Reddy", "Zakir Reddy", "Koyal Nair", "Ansar Nair", "Vibha Choudhary", "Zulfiqar Choudhary", 
    "Dhvani Desai", "Keshav Desai", "Mitali Patel", "Rajesh Patel", "Kriva Mehta", "Brijesh Mehta", "Harshika Rajput", "Chandan Rajput", "Gopika Goyal", "Devendra Goyal", "Kavisha Malhotra", "Ram Malhotra", "Ujjwala Gupta", 
    "Sunil Gupta", "Jhanavi Menon", "Ajith Menon", "Shobha Joshi", "Gagan Joshi", "Saavi Agarwal", "Tarun Agarwal", "Aadya Bansal", "Ajoy Bansal", "Aanya Rathore", "Manohar Rathore", "Aabha Verma", "Rameez Verma", 
    "Aafreen Pillai", "Arun Pillai", "Varnika Kulkarni", "Harshal Kulkarni", "Chhaya Jadhav", "Nihar Jadhav", "Kritisha Shetty", "Pramod Shetty", "Swara Pawar", "Sriram Pawar", "Dhanashree Krishna", "Pradyumna Krishna", 
    "Palak Sharma", "Adwait Sharma", "Akruti Singh", "Rahul Singh", "Hemisha Iyer", "Amanjeet Iyer", "Pari Reddy", "Sadiq Reddy", "Geethika Nair", "Taslim Nair", "Shaswati Choudhary", "Iqra Choudhary", "Pihu Desai", 
    "Nikhil Desai", "Parnika Patel", "Ruturaj Patel", "Aakansha Mehta", "Kush Mehta", "Anshika Rajput", "Ashutosh Rajput", "Madhumita Goyal", "Bharat Goyal", "Trupti Malhotra", "Sameer Malhotra", "Jayashree Gupta", 
    "Jagdish Gupta", "Charulata Menon", "Ricky Menon", "Haripriya Joshi", "Pranay Joshi", "Mrinal Agarwal", "Vinod Agarwal", "Poonam Bansal", "Vipin Bansal", "Rituja Rathore", "Sumeet Rathore", "Rasika Verma", "Raghunath Verma", 
    "Roshika Pillai", "Sahil Pillai", "Kumudini Kulkarni", "Adarsh Kulkarni", "Seerat Jadhav", "Deep Jadhav", "Naira Shetty", "Prem Shetty", "Samaira Pawar", "Vishwesh Pawar", "Aanchika Krishna", "Arnav Krishna", "Shinjini Sharma", 
    "Deepinder Sharma", "Jigyasa Singh", "Shantanu Singh", "Prakriti Iyer", "Gireesh Iyer", "Shweta Reddy", "Shehzad Reddy", "Vaidehi Nair", "Imran Nair", "Bhoomika Choudhary", "Azhar Choudhary", "Charisma Desai", "Jai Desai", 
    "Shrivalli Patel", "Karthik Patel", "Manasi Mehta", "Amol Mehta", "Oorja Rajput", "Lokendra Rajput", "Kashvi Goyal", "Girdhar Goyal", "Bhawna Malhotra", "Veer Malhotra", "Ambalika Gupta", "Subhash Gupta", "Nishka Menon", 
    "Kanhaiya Menon", "Anugya Joshi", "Sharad Joshi", "Namrata Agarwal", "Surendra Agarwal", "Yogita Bansal", "Amar Bansal", "Rajshree Rathore", "Rakesh Rathore", "Sunanda Verma", "Murtaza Verma", "Shylaja Pillai", "Yusuf Pillai", 
    "Shrilekha Kulkarni", "Keshor Kulkarni", "Radhya Jadhav", "Anil Jadhav", "Mallika Shetty", "Alpesh Shetty", "Lalita Pawar", "Anoop Pawar", "Sahana Krishna", "Somendra Krishna", "Aditri Sharma", "Hemendra Sharma", "Anshi Singh", 
    "Sushant Singh", "Damini Iyer", "Ajeet Iyer", "Vidisha Reddy", "Gokul Reddy", "Aarya Nair", "Ravi Nair", "Hiral Choudhary", "Haroon Choudhary", "Suchitra Desai", "Nadeem Desai", "Shireen Patel", "Harikrishna Patel", "Maitreyee Mehta", "Rajan Mehta", "Yogini Rajput", "Subho Rajput", "Vaishali Goyal", "Kapil Goyal", "Krisha Malhotra", "Manu Malhotra", "Leher Gupta", "Asgar Gupta", "Simona Menon", "Pritam Menon", "Sandhya Joshi", 
    "Arindam Joshi", "Shraddha Agarwal", "Dilip Agarwal", "Ishana Bansal", "Shakti Bansal", "Chandrika Rathore", "Ravish Rathore", "Smruti Verma", "Subhaan Verma", "Natasha Pillai", "Zaheer Pillai", "Monisha Kulkarni", 
    "Naveen Kulkarni", "Darshita Jadhav", "Shiva Jadhav", "Suman Shetty", "Surya Shetty", "Riya Pawar", "Sanjit Pawar", "Saloni Krishna", "Manas Krishna"
];

const generateParticipants = () => {
    // Shuffle the names to get a random order
    const shuffledNames = [...participantNames].sort(() => Math.random() - 0.5);

    return Array.from({ length: 800 }, (_, i) => {
        const name = shuffledNames[i % shuffledNames.length];
        return {
            id: i + 1,
            name: name,
            image: `${401 + i}`,
            isMicOn: false,
            isVideoOn: false,
        };
    });
};

const allParticipants = generateParticipants();


export default function MeetingPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("video");
  const [videoLayout, setVideoLayout] = useState<VideoLayout>('speaker');
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [imageFit, setImageFit] = useState<ImageFit>('cover');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();
  
  const host = participants.find(p => p.id === 0);
  const otherParticipants = participants.filter(p => p.id !== 0);

  useEffect(() => {
    // Start with the teacher
    const teacher: Participant = {
      id: 0,
      name: "Next Inn Host",
      image: '400',
      isMicOn: true,
      isVideoOn: true,
    };
    setParticipants([teacher]);

    // Delay before participants start joining
    const joinDelay = setTimeout(() => {
        // Then add other participants over time
        const interval = setInterval(() => {
          setParticipants(prev => {
            const currentCount = prev.length - 1; // -1 for the teacher
            if (currentCount >= allParticipants.length) {
              clearInterval(interval);
              return prev;
            }

            const newParticipantCount = Math.floor(Math.random() * 10) + 1;
            const nextParticipants = allParticipants.slice(currentCount, currentCount + newParticipantCount);
            
            if (nextParticipants.length > 0) {
                return [...prev, ...nextParticipants];
            } else {
                clearInterval(interval);
                return prev;
            }
          });
        }, Math.random() * (5000 - 1000) + 1000); // Add participants every 1-5 seconds
        
        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, 120000); // 2 minutes delay

    // Cleanup timeout on component unmount
    return () => clearTimeout(joinDelay);
  }, []);

  const getCameraPermission = useCallback(async () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        setHasCameraPermission(true);

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this app.',
        });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if(videoRef.current) {
        videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
      const host = participants.find(p => p.id === 0);
      if (host?.isVideoOn) {
          getCameraPermission();
      } else {
          stopCamera();
      }
  }, [participants, getCameraPermission, stopCamera]);


  const handleScreenShareToggle = async () => {
    if (viewMode === 'share') {
      screenStream?.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setViewMode('video');
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        stream.getVideoTracks()[0].onended = () => {
            setScreenStream(null);
            setViewMode('video');
        };
        setScreenStream(stream);
        setViewMode('share');
      } catch (error) {
        console.error("Screen share error:", error);
        toast({
          variant: "destructive",
          title: "Screen Share Failed",
          description: "Could not start screen sharing. Please check permissions.",
        });
        setViewMode('video');
      }
    }
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" } as any,
        audio: true,
      });
      
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      recordedChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm; codecs=vp9'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NextInn-Recording-${new Date().toISOString()}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({
          title: "Recording Saved",
          description: "Your recording has been downloaded.",
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "The meeting is now being recorded.",
      });

    } catch (error) {
      console.error("Recording error:", error);
      toast({
        variant: "destructive",
        title: "Recording Failed",
        description: "Could not start recording. Please check permissions.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  const handleEndCall = () => {
    if (isRecording) {
      stopRecording();
    }
    setShowExitDialog(true);
  };
  
  const leaveMeeting = () => {
    setShowExitDialog(false);
    router.push('/goodbye');
  };

  const toggleMic = (id: number) => {
    if (id !== 0) return; // only allow host to toggle
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, isMicOn: !p.isMicOn } : p));
  };

  const toggleVideo = (id: number) => {
    if (id !== 0) return; // only allow host to toggle
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, isVideoOn: !p.isVideoOn } : p));
  };


  const handleOpenPolls = () => {
    window.open('/polls', '_blank', 'width=500,height=700,resizable=yes,scrollbars=yes');
  }
  
  const ParticipantCard = ({ participant, isHostCard = false }: { participant: Participant, isHostCard?: boolean }) => {
    return (
    <div className="bg-card rounded-lg flex items-center justify-center aspect-video relative overflow-hidden group border border-transparent hover:border-primary transition-colors">
      {participant.id === 0 ? (
         <>
         {host?.isVideoOn ? (
           <video ref={videoRef} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 transform -scale-x-100" autoPlay muted playsInline />
         ) : (
           <Image 
             src="https://i.ibb.co/ynr7K0cz/host.jpg"
             alt="Host camera off"
             width={400}
             height={300}
             data-ai-hint="person portrait"
             className={cn(
                "w-full h-full transition-transform duration-300 group-hover:scale-105",
                imageFit === 'cover' ? 'object-cover' : 'object-contain'
             )}
           />
         )}
         {hasCameraPermission === false && host?.isVideoOn && (
           <div className="absolute inset-0 bg-secondary flex flex-col items-center justify-center gap-2 p-4 text-center">
             <Avatar className="w-24 h-24 text-3xl">
               <AvatarFallback className="bg-primary/20 text-primary-foreground/80">
                 {participant.name.split(' ').map(n => n[0]).join('')}
               </AvatarFallback>
             </Avatar>
             <Alert variant="destructive" className="mt-4">
               <AlertTitle>Camera Access Required</AlertTitle>
               <AlertDescription>
                 Please allow camera access to use this feature.
               </AlertDescription>
             </Alert>
           </div>
         )}
       </>
      ) : participant.isVideoOn ? (
        <Image 
          src={`https://picsum.photos/seed/${participant.image}/400/300`} 
          alt={participant.name} 
          width={400}
          height={300}
          data-ai-hint="person portrait"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Avatar className="w-24 h-24 text-3xl">
                <AvatarFallback className="bg-primary/20 text-primary-foreground/80">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
            </Avatar>
        </div>
      )}
       {participant.id === 0 && (
         <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => toggleMic(participant.id)}>
            {participant.isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => toggleVideo(participant.id)}>
            {participant.isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
        </div>
       )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-sm flex items-center gap-2 pt-4">
        {participant.isMicOn ? <Mic className="h-4 w-4 text-green-400"/> : <MicOff className="h-4 w-4 text-red-500"/>}
        <span className="font-medium">{participant.name}</span>
      </div>
    </div>
  )};

  const renderVideoView = () => {
    if (videoLayout === 'grid') {
      return (
        <ScrollArea className="h-full w-full">
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {host && <ParticipantCard participant={host} isHostCard={true} />}
              {otherParticipants.map((p) => (
                  <ParticipantCard key={p.id} participant={p} />
              ))}
          </div>
        </ScrollArea>
      );
    }
    
    // Speaker view
    return (
       <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={75}>
            <div className="flex items-center justify-center h-full w-full p-4">
              {host && <ParticipantCard participant={host} isHostCard={true} />}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-4">
                {otherParticipants.slice(0,10).map((p) => (
                  <ParticipantCard key={p.id} participant={p} />
                ))}
                <Dialog open={isParticipantListOpen} onOpenChange={setIsParticipantListOpen}>
                  <DialogTrigger asChild>
                    <button className="bg-secondary rounded-lg w-full flex items-center justify-center aspect-video relative overflow-hidden group cursor-pointer hover:bg-primary/10 border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Users className="h-10 w-10" />
                            <span>View All ({participants.length})</span>
                        </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>All Participants ({participants.length})</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-1 -mr-6">
                      <div className="space-y-4 pr-6">
                        {participants.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary">
                            <div className="flex items-center gap-4">
                              <Avatar>
                                 <AvatarFallback className="bg-primary/20 text-primary-foreground/80">
                                    {p.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span>{p.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                               {p.id === 0 ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                          <Label htmlFor={`mic-switch-${p.id}`} className="text-sm">Mic</Label>
                                          <Switch id={`mic-switch-${p.id}`} checked={p.isMicOn} onCheckedChange={() => toggleMic(p.id)} />
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <Label htmlFor={`video-switch-${p.id}`} className="text-sm">Video</Label>
                                          <Switch id={`video-switch-${p.id}`} checked={p.isVideoOn} onCheckedChange={() => toggleVideo(p.id)} />
                                      </div>
                                    </>
                                ) : (
                                    <>
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <MicOff className="h-4 w-4" />
                                        <span className="text-sm">Mic Off</span>
                                      </div>
                                       <div className="flex items-center gap-2 text-muted-foreground">
                                        <VideoOff className="h-4 w-4" />
                                        <span className="text-sm">Video Off</span>
                                      </div>
                                    </>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
    );
  }

  const renderView = () => {
    switch(viewMode) {
      case 'share':
        return screenStream ? <ScreenShareView stream={screenStream} /> : <div className="flex items-center justify-center h-full text-muted-foreground">No screen share stream.</div>;
      case 'draw':
        return <DrawingCanvas />;
      case 'video':
      default:
        return renderVideoView();
    }
  }

  return (
    <>
      <div className="flex h-screen w-full flex-col bg-background text-foreground">
        <AppHeader 
          participantCount={participants.length}
          isRecording={isRecording} 
          onRecordingToggle={handleRecordingToggle}
          onEndCall={handleEndCall}
          imageFit={imageFit}
          onImageFitChange={setImageFit}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 h-full bg-secondary/30">
            {renderView()}
          </div>
        </main>

        <footer className="flex items-center justify-center gap-2 py-2 px-4 bg-card border-t">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={viewMode === 'video' ? 'secondary' : 'ghost'} size="lg" onClick={() => setViewMode('video')}>
                    <Video className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Video</p></TooltipContent>
              </Tooltip>
              {viewMode === 'video' && (
                <>
                 <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant={videoLayout === 'speaker' ? 'secondary' : 'ghost'} size="icon" onClick={() => setVideoLayout('speaker')}>
                          <UserSquare className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Speaker View</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant={videoLayout === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setVideoLayout('grid')}>
                          <LayoutGrid className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Grid View</p></TooltipContent>
                  </Tooltip>
                </>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={viewMode === 'draw' ? 'secondary' : 'ghost'} size="lg" onClick={() => setViewMode('draw')}>
                    <Edit3 className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Whiteboard</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={viewMode === 'share' ? 'secondary' : 'ghost'} size="lg" onClick={handleScreenShareToggle}>
                    <ScreenShare className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Screen Share</p></TooltipContent>
              </Tooltip>
              <div className="w-px h-8 bg-border mx-4" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={'ghost'} size="lg" onClick={handleOpenPolls}>
                    <Vote className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Open Polls</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </footer>
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave the meeting? If you are recording, it will be stopped and saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={leaveMeeting}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
