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
import { Video, Edit3, Vote, ScreenShare, Mic, MicOff, VideoOff, MoreHorizontal } from "lucide-react";
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

type ViewMode = "video" | "draw" | "share";

type Participant = {
  id: number;
  name: string;
  image: string;
  isMicOn: boolean;
  isVideoOn: boolean;
};

const participantNames = [
  "Aadhya Sharma", "Aarohi Singh", "Ananya Iyer", "Aishwarya Reddy", "Amrita Nair", "Avni Choudhary", "Bhavya Desai", "Charvi Patel", "Diya Mehta", "Divya Rajput", "Ekta Goyal", "Ishika Malhotra",
  "Aarav Sharma", "Advait Singh", "Arjun Iyer", "Aman Reddy", "Anirudh Nair", "Aryan Choudhary", "Bhavesh Desai", "Chaitanya Patel", "Dev Mehta", "Dhruv Rajput", "Eshan Goyal", "Ishaan Malhotra",
  "Jyoti Gupta", "Kavya Menon", "Meera Joshi", "Nandini Agarwal", "Radhika Bansal", "Sakshi Rathore", "Shreya Verma", "Tanvi Pillai", "Anika Kulkarni", "Sneha Jadhav", "Sanya Shetty", "Kritika Pawar", "Harini Krishna", "Pooja Sharma", "Ritu Singh", "Swati Iyer", "Neha Reddy", "Shraddha Nair", "Ishani Choudhary", "Aarti Desai", "Kiran Patel", "Monika Mehta", "Varsha Rajput", "Lavanya Goyal", "Smita Malhotra", "Vandana Gupta", "Reshma Menon", "Reema Joshi", "Aparna Agarwal", "Trisha Bansal", "Payal Rathore", "Apeksha Verma", "Dipali Pillai", "Pallavi Kulkarni", "Suchitra Jadhav", "Harshita Shetty", "Mala Pawar", "Vidya Krishna", "Sonali Sharma", "Gauri Singh", "Prerna Iyer", "Shalini Reddy", "Bhavana Nair", "Anushka Choudhary", "Malika Desai", "Chhavi Patel", "Jaya Mehta", "Savita Rajput", "Simran Goyal", "Nisha Malhotra", "Kusum Gupta", "Kamini Menon", "Sudha Joshi", "Harsha Agarwal", "Manasi Bansal", "Usha Rathore", "Renu Verma", "Sonam Pillai", "Bharti Kulkarni", "Shweta Jadhav", "Hemlata Shetty", "Rekha Pawar", "Anvi Krishna", "Mridula Sharma", "Tanya Singh", "Megha Iyer", "Namrata Reddy", "Veena Nair", "Yamini Choudhary", "Ketaki Desai", "Preeti Patel", "Radha Mehta", "Alka Rajput", "Asha Goyal", "Rupali Malhotra", "Priya Gupta", "Seema Menon", "Anita Joshi", "Smruti Agarwal", "Gayatri Bansal", "Kalyani Rathore", "Nargis Verma", "Vandita Pillai", "Shruti Kulkarni", "Padmini Jadhav", "Madhavi Shetty", "Lata Pawar", "Jhanvi Krishna",
  "Jay Gupta", "Kunal Menon", "Mihir Joshi", "Nikhil Agarwal", "Rohan Bansal", "Siddharth Rathore", "Tanish Verma", "Varun Pillai", "Abhishek Kulkarni", "Saurabh Jadhav", "Karthik Shetty", "Pranav Pawar", "Aditya Krishna", "Manish Sharma", "Vivek Singh", "Harsh Iyer", "Rohit Reddy", "Sameer Nair", "Umar Choudhary", "Parth Desai", "Umesh Patel", "Nitin Mehta", "Rajeev Rajput", "Sagar Goyal", "Tejas Malhotra", "Vijay Gupta", "Ajay Menon", "Anil Joshi", "Pankaj Agarwal", "Nitesh Bansal", "Suraj Rathore", "Mohit Verma", "Yogesh Pillai", "Sunil Kulkarni", "Rajesh Jadhav", "Arvind Shetty", "Akash Pawar", "Lakshman Krishna", "Ramesh Sharma", "Deepak Singh", "Naveen Iyer", "Sanjay Reddy", "Ashok Nair", "Shubham Choudhary", "Mahesh Desai", "Vinay Patel", "Ankit Mehta", "Girish Rajput", "Kapil Goyal", "Omkar Malhotra", "Raj Gupta", "Arun Menon", "Shankar Joshi", "Hemant Agarwal", "Alok Bansal", "Bhuvan Rathore", "Piyush Verma", "Rajat Pillai", "Sandeep Kulkarni", "Ganesh Jadhav", "Om Shetty", "Bharat Pawar", "Harendra Krishna", "Yash Sharma", "Amanat Singh", "Devansh Iyer", "Kabir Reddy", "Farhan Nair", "Imran Choudhary", "Ayaan Desai", "Chetan Patel", "Rakesh Mehta", "Jitendra Rajput", "Arman Goyal", "Samar Malhotra", "Dharmesh Gupta", "Balaji Menon", "Kishore Joshi", "Ashwin Agarwal", "Danish Bansal", "Faisal Rathore", "Hanuman Verma", "Kartik Pillai", "Vikas Kulkarni", "Tanmay Jadhav", "Lucky Shetty", "Jeet Pawar", "Raghav Krishna",
  "Bhavna Sharma", "Aaradhya Singh", "Sanjana Iyer", "Nikita Reddy", "Roshni Nair", "Khushi Choudhary", "Geeta Desai", "Muskaan Patel", "Snehal Mehta", "Sakina Rajput", "Aalisha Goyal", "Nivedita Malhotra", "Neelam Gupta", "Sunita Menon", "Reena Joshi", "Tanisha Agarwal", "Deepika Bansal", "Hema Rathore", "Juhi Verma", "Kajal Pillai", "Madhura Kulkarni", "Ayesha Jadhav", "Noor Shetty", "Sana Pawar", "Taruna Krishna", "Karishma Sharma", "Ankita Singh", "Bhagyashree Iyer", "Rekha Reddy", "Sarika Nair", "Ambika Choudhary", "Pushpa Desai", "Kriti Patel", "Manisha Mehta", "Sonya Rajput", "Pallavi Goyal", "Anjuli Malhotra", "Charul Gupta", "Richa Menon", "Vishakha Joshi", "Kshama Agarwal", "Dimple Bansal", "Monica Rathore", "Aarushi Verma", "Parul Pillai", "Shubha Kulkarni", "Bhairavi Jadhav", "Sugandha Shetty", "Arpita Pawar", "Ritika Krishna", "Jagruti Sharma", "Harleen Singh", "Rupal Iyer", "Pratibha Reddy", "Madhavi Nair", "Nirmala Choudhary", "Vandita Desai", "Kamala Patel", "Anjali Mehta", "Mrunal Rajput", "Poorva Goyal", "Snehalata Malhotra", "Deepali Gupta", "Ahlam Menon", "Yamika Joshi", "Saumya Agarwal", "Chaitali Bansal", "Kumud Rathore", "Purnima Verma", "Nidhi Pillai", "Radhika Kulkarni", "Lavina Jadhav", "Maitri Shetty", "Hiral Pawar", "Avantika Krishna", "Tajinder Sharma", "Gunjan Singh", "Krupa Iyer", "Pranjali Reddy", "Haritha Nair", "Devika Choudhary", "Shibani Desai", "Leena Patel", "Sejal Mehta", "Madhuri Rajput", "Amisha Goyal", "Aakriti Malhotra", "Falak Gupta", "Medha Menon", "Latika Joshi", "Amruta Agarwal", "Vinita Bansal", "Akriti Rathore", "Stuti Verma", "Dhara Pillai", "Nandita Kulkarni", "Malini Jadhav", "Manjari Shetty", "Ojaswini Pawar", "Supriya Krishna",
  "Mukesh Sharma", "Sohail Singh", "Bhushan Iyer", "Raghu Reddy", "Veeresh Nair", "Adnan Choudhary", "Jaideep Desai", "Paresh Patel", "Krishna Mehta", "Shreyas Rajput", "Puneet Goyal", "Shaan Malhotra", "Harish Gupta", "Sumanth Menon", "Rakesh Joshi", "Manjunath Agarwal", "Ritvik Bansal", "Anwar Rathore", "Imtiaz Verma", "Amanullah Pillai", "Vishal Kulkarni", "Mohan Jadhav", "Nishant Shetty", "Mitesh Pawar", "Jai Krishna", "Saket Sharma", "Balram Singh", "Rituraj Iyer", "Sufyan Reddy", "Hamza Nair", "Salman Choudhary", "Darshan Desai", "Gopal Patel", "Nilesh Mehta", "Ashraf Rajput", "Omprakash Goyal", "Vipul Malhotra", "Prashanth Gupta", "Nandan Menon", "Rajan Joshi", "Shafi Agarwal", "Kailash Bansal", "Sanjeev Rathore", "Rameshwar Verma", "Nadeem Pillai", "Govind Kulkarni", "Ranveer Jadhav", "Milan Shetty", "Amar Pawar", "Shantanu Krishna", "Jaspreet Sharma", "Gurpreet Singh", "Angad Iyer", "Afzal Reddy", "Arbaaz Nair", "Sharad Choudhary", "Bhargav Desai", "Jignesh Patel", "Rahul Mehta", "Dilip Rajput", "Shailesh Goyal", "Rajnish Malhotra", "Ajmal Gupta", "Raman Menon", "Darshan Joshi", "Swapnil Agarwal", "Zakir Bansal", "Anup Rathore", "Rafiq Verma", "Basavaraj Pillai", "Vinod Kulkarni", "Mahadev Jadhav", "Parvez Shetty", "Rajiv Pawar", "Shivendra Krishna", "Arjit Sharma", "Lakshay Singh", "Mayank Iyer", "Salman Reddy", "Moin Nair", "Aftab Choudhary", "Lalit Desai", "Bharat Patel", "Pradeep Mehta", "Satyam Rajput", "Haroon Goyal", "Anmol Malhotra", "Narendra Gupta", "Mohd. Irfan Menon", "Harshit Joshi", "Indrajit Agarwal", "Nirmal Bansal", "Arif Rathore", "Wahid Verma", "Ravi Pillai", "Vikrant Kulkarni", "Satyajeet Jadhav", "Hiren Shetty", "Sameep Pawar", "Adarsh Krishna",
  "Shilpa Sharma", "Ayesha Singh", "Hetal Iyer", "Bharti Reddy", "Meenal Nair", "Surabhi Choudhary", "Shuchi Desai", "Urvashi Patel", "Roma Mehta", "Priyanka Rajput", "Sheetal Goyal", "Namita Malhotra", "Archana Gupta", "Sushma Menon", "Tanmaya Joshi", "Charuta Agarwal", "Monica Bansal", "Madhusha Rathore", "Amita Verma", "Swara Pillai", "Maya Kulkarni", "Neelofar Jadhav", "Ishrat Shetty", "Reshma Pawar", "Rupashree Krishna", "Vaishnavi Sharma", "Janhavi Singh", "Ketaki Iyer", "Rituparna Reddy", "Kajri Nair", "Radhiya Choudhary", "Lopa Desai", "Shruti Patel", "Poonam Mehta", "Prachi Rajput", "Seher Goyal", "Shruthi Malhotra", "Aakanksha Gupta", "Kshama Menon", "Amreen Joshi", "Shagufta Agarwal", "Noorjahan Bansal", "Nahid Rathore", "Sitara Verma", "Almas Pillai", "Mahima Kulkarni", "Sumedha Jadhav", "Padma Shetty", "Aaruni Pawar", "Aanchal Krishna",
  "Shivam Sharma", "Aman Singh", "Ishwar Iyer", "Khalid Reddy", "Zubair Nair", "Maqsood Choudhary", "Rituraj Desai", "Bhupendra Patel", "Prakash Mehta", "Rakesh Rajput", "Niraj Goyal", "Atul Malhotra", "Aadil Gupta", "Brijesh Menon", "Madhav Joshi", "Himanshu Agarwal", "Pawan Bansal", "Noman Rathore", "Amarendra Verma", "Rakesh Pillai", "Shyamal Kulkarni", "Amarjeet Jadhav", "Rohail Shetty", "Sahil Pawar", "Chiranjeev Krishna", "Harinder Sharma", "Shivraj Singh", "Ashwath Iyer", "Iqbal Reddy", "Sarfaraz Nair", "Rizwan Choudhary", "Nandkishore Desai", "Ashwin Patel", "Krunal Mehta", "Ansh Rajput", "Vishnu Goyal", "Lokesh Malhotra", "Rasik Gupta", "Shravan Menon", "Surya Joshi", "Sunil Agarwal", "Mahesh Bansal", "Lokendra Rathore", "Tayyab Verma", "Mustafa Pillai", "Sreekant Kulkarni", "Amrit Jadhav", "Salman Shetty", "Divyansh Pawar", "Chinmay Krishna",
  "Navya Sharma", "Ira Singh", "Ahana Iyer", "Nitya Reddy", "Anvi Nair", "Kriti Choudhary", "Sejal Desai", "Diya Patel", "Charita Mehta", "Oviya Rajput", "Amna Goyal", "Snehal Malhotra", "Kushi Gupta", "Shanaya Menon", "Aaratrika Joshi", "Bhoomi Agarwal", "Eesha Bansal", "Ishwari Rathore", "Muskaan Verma", "Aahana Pillai", "Sonika Kulkarni", "Sanvi Jadhav", "Aradhya Shetty", "Keya Pawar", "Shradha Krishna", "Aayushi Sharma", "Lavina Singh", "Nyra Iyer", "Shifali Reddy", "Koyal Nair", "Vibha Choudhary", "Dhvani Desai", "Mitali Patel", "Kriva Mehta", "Harshika Rajput", "Gopika Goyal", "Kavisha Malhotra", "Ujjwala Gupta", "Jhanavi Menon", "Shobha Joshi", "Saavi Agarwal", "Aadya Bansal", "Aanya Rathore", "Aabha Verma", "Aafreen Pillai", "Varnika Kulkarni", "Chhaya Jadhav", "Kritisha Shetty", "Swara Pawar", "Dhanashree Krishna", "Palak Sharma", "Akruti Singh", "Hemisha Iyer", "Pari Reddy", "Geethika Nair", "Shaswati Choudhary", "Pihu Desai", "Parnika Patel", "Aakansha Mehta", "Anshika Rajput", "Madhumita Goyal", "Trupti Malhotra", "Jayashree Gupta", "Charulata Menon", "Haripriya Joshi", "Mrinal Agarwal", "Poonam Bansal", "Rituja Rathore", "Rasika Verma", "Roshika Pillai", "Kumudini Kulkarni", "Seerat Jadhav", "Naira Shetty", "Samaira Pawar", "Aanchika Krishna", "Shinjini Sharma", "Jigyasa Singh", "Prakriti Iyer", "Shweta Reddy", "Vaidehi Nair", "Bhoomika Choudhary", "Charisma Desai", "Shrivalli Patel", "Manasi Mehta", "Oorja Rajput", "Kashvi Goyal", "Bhawna Malhotra", "Ambalika Gupta", "Nishka Menon", "Anugya Joshi", "Namrata Agarwal", "Yogita Bansal", "Rajshree Rathore", "Sunanda Verma", "Shylaja Pillai", "Shrilekha Kulkarni", "Radhya Jadhav", "Mallika Shetty", "Lalita Pawar", "Sahana Krishna", "Aditri Sharma", "Anshi Singh", "Damini Iyer", "Vidisha Reddy", "Aarya Nair", "Hiral Choudhary", "Suchitra Desai", "Shireen Patel", "Maitreyee Mehta", "Yogini Rajput", "Vaishali Goyal", "Krisha Malhotra", "Leher Gupta", "Simona Menon", "Sandhya Joshi", "Shraddha Agarwal", "Ishana Bansal", "Chandrika Rathore", "Smruti Verma", "Natasha Pillai", "Monisha Kulkarni", "Darshita Jadhav", "Suman Shetty", "Riya Pawar", "Saloni Krishna",
  "Ankur Sharma", "Tushar Singh", "Harith Iyer", "Danish Reddy", "Roshan Nair", "Arshad Choudhary", "Rupesh Desai", "Hemant Patel", "Rajiv Mehta", "Ravindra Rajput", "Praveen Goyal", "Om Malhotra", "Alok Gupta", "Santosh Menon", "Sandeep Joshi", "Dhiraj Agarwal", "Jatin Bansal", "Rituraj Rathore", "Sunny Verma", "Vignesh Pillai", "Ujjwal Kulkarni", "Vishal Jadhav", "Ramesh Shetty", "Karthikey Pawar", "Vineet Krishna", "Mihir Sharma", "Prithviraj Singh", "Kiran Iyer", "Zakir Reddy", "Ansar Nair", "Zulfiqar Choudhary", "Keshav Desai", "Rajesh Patel", "Brijesh Mehta", "Chandan Rajput", "Devendra Goyal", "Ram Malhotra", "Sunil Gupta", "Ajith Menon", "Gagan Joshi", "Tarun Agarwal", "Ajoy Bansal", "Manohar Rathore", "Rameez Verma", "Arun Pillai", "Harshal Kulkarni", "Nihar Jadhav", "Pramod Shetty", "Sriram Pawar", "Pradyumna Krishna", "Adwait Sharma", "Rahul Singh", "Amanjeet Iyer", "Sadiq Reddy", "Taslim Nair", "Iqra Choudhary", "Nikhil Desai", "Ruturaj Patel", "Kush Mehta", "Ashutosh Rajput", "Bharat Goyal", "Sameer Malhotra", "Jagdish Gupta", "Ricky Menon", "Pranay Joshi", "Vinod Agarwal", "Vipin Bansal", "Sumeet Rathore", "Raghunath Verma", "Sahil Pillai", "Adarsh Kulkarni", "Deep Jadhav", "Prem Shetty", "Vishwesh Pawar", "Arnav Krishna", "Deepinder Sharma", "Shantanu Singh", "Gireesh Iyer", "Shehzad Reddy", "Imran Nair", "Azhar Choudhary", "Jai Desai", "Karthik Patel", "Amol Mehta", "Lokendra Rajput", "Girdhar Goyal", "Veer Malhotra", "Subhash Gupta", "Kanhaiya Menon", "Sharad Joshi", "Surendra Agarwal", "Amar Bansal", "Rakesh Rathore", "Murtaza Verma", "Yusuf Pillai", "Keshor Kulkarni", "Anil Jadhav", "Alpesh Shetty", "Anoop Pawar", "Somendra Krishna", "Hemendra Sharma", "Sushant Singh", "Ajeet Iyer", "Gokul Reddy", "Ravi Nair", "Haroon Choudhary", "Nadeem Desai", "Harikrishna Patel", "Rajan Mehta", "Subho Rajput", "Kapil Goyal", "Manu Malhotra", "Asgar Gupta", "Pritam Menon", "Arindam Joshi", "Dilip Agarwal", "Shakti Bansal", "Ravish Rathore", "Subhaan Verma", "Zaheer Pillai", "Naveen Kulkarni", "Shiva Jadhav", "Surya Shetty", "Sanjit Pawar", "Manas Krishna", "Shaurya Sharma", "Nirbhay Singh", "Vikram Iyer", "Riyas Reddy", "Mohd. Saif Nair", "Sameer Choudhary", "Prathamesh Desai", "Ajeet Patel", "Rakesh Mehta", "Dinesh Rajput", "Lokesh Goyal", "Narayan Malhotra", "Shripal Gupta", "Murali Menon", "Abhay Joshi", "Ramakrishnan Agarwal", "Suhail Bansal", "Tabrez Rathore", "Taslim Verma", "Iman Pillai", "Gopal Kulkarni", "Mohan Jadhav", "Ravi Shetty", "Ratin Pawar", "Amaan Krishna", "Kishan Sharma", "Lucky Singh", "Dharmender Iyer", "Abdur Reddy", "Ismail Nair", "Shahrukh Choudhary", "Irfan Desai", "Vivekananda Patel", "Ujjwal Mehta", "Chittaranjan Rajput", "Niroshan Goyal", "Krish Malhotra", "Ravinder Gupta", "Samarjeet Menon", "Anshu Joshi", "Pratham Agarwal", "Sonu Bansal", "Brij Rathore", "Danish Verma", "Affan Pillai", "Shivu Kulkarni", "Shyamal Jadhav", "Shravan Shetty", "Kamal Pawar", "Shrey Krishna",
];

const allParticipants: Participant[] = Array.from({ length: 800 }, (_, i) => {
    const name = participantNames[i % participantNames.length];
    return {
        id: i + 1,
        name: name,
        image: `${401 + i}`,
        isMicOn: false,
        isVideoOn: false,
    };
});

export default function Home() {
  const [isPollPanelOpen, setIsPollPanelOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("video");
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>(allParticipants);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();

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
        a.download = `SimuMeet-Recording-${new Date().toISOString()}.webm`;
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
  }

  const toggleMic = (id: number) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, isMicOn: !p.isMicOn } : p));
  };

  const toggleVideo = (id: number) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, isVideoOn: !p.isVideoOn } : p));
  };
  
  const ParticipantCard = ({ participant }: { participant: Participant }) => (
    <div className="bg-card rounded-lg flex items-center justify-center aspect-video relative overflow-hidden group">
      {participant.isVideoOn ? (
        <Image 
          src={`https://picsum.photos/seed/${participant.image}/400/300`} 
          alt={participant.name} 
          width={400}
          height={300}
          data-ai-hint="person portrait"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
            <Avatar className="w-24 h-24">
                <AvatarFallback className="text-3xl bg-primary/20 text-primary">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
            </Avatar>
        </div>
      )}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => toggleMic(participant.id)}>
          {participant.isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => toggleVideo(participant.id)}>
          {participant.isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white text-sm flex items-center gap-2">
        {participant.isMicOn ? <Mic className="h-4 w-4 text-green-400"/> : <MicOff className="h-4 w-4 text-red-500"/>}
        <span>{participant.name}</span>
      </div>
    </div>
  );

  const renderView = () => {
    switch(viewMode) {
      case 'share':
        return screenStream ? <ScreenShareView stream={screenStream} /> : <div className="flex items-center justify-center h-full text-muted-foreground">No screen share stream.</div>;
      case 'draw':
        return <DrawingCanvas />;
      case 'video':
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 h-full overflow-auto">
            {participants.slice(0, 11).map((p) => (
              <ParticipantCard key={p.id} participant={p} />
            ))}
            <Dialog open={isParticipantListOpen} onOpenChange={setIsParticipantListOpen}>
              <DialogTrigger asChild>
                <div className="bg-card rounded-lg flex items-center justify-center aspect-video relative overflow-hidden group cursor-pointer hover:bg-muted">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <MoreHorizontal className="h-10 w-10" />
                        <span>View More</span>
                    </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>All Participants ({participants.length})</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-6">
                    {participants.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{p.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span>{p.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                              <Label htmlFor={`mic-switch-${p.id}`} className="text-sm">Mic</Label>
                              <Switch id={`mic-switch-${p.id}`} checked={p.isMicOn} onCheckedChange={() => toggleMic(p.id)} />
                          </div>
                          <div className="flex items-center gap-2">
                              <Label htmlFor={`video-switch-${p.id}`} className="text-sm">Video</Label>                              <Switch id={`video-switch-${p.id}`} checked={p.isVideoOn} onCheckedChange={() => toggleVideo(p.id)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        );
    }
  }

  return (
    <>
      <div className="flex h-screen w-full flex-col bg-background text-foreground">
        <AppHeader 
          isRecording={isRecording} 
          onRecordingToggle={handleRecordingToggle}
          onEndCall={handleEndCall}
        />
        <div className="flex flex-1 overflow-hidden">
          <nav className="flex flex-col items-center gap-4 py-4 px-2 bg-card border-r">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={viewMode === 'video' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('video')}>
                    <Video className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Video Grid</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={viewMode === 'draw' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('draw')}>
                    <Edit3 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Whiteboard</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={viewMode === 'share' ? 'secondary' : 'ghost'} size="icon" onClick={handleScreenShareToggle}>
                    <ScreenShare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Screen Share</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="mt-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={isPollPanelOpen ? 'secondary' : 'ghost'} size="icon" onClick={() => setIsPollPanelOpen(!isPollPanelOpen)}>
                      <Vote className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right"><p>Toggle Polls</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </nav>
          <main className="flex-1 flex flex-col">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              <ResizablePanel defaultSize={75}>
                <div className="flex-1 h-full">
                  {renderView()}
                </div>
              </ResizablePanel>
              {isPollPanelOpen && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                    <PollPanel />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </main>
        </div>
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
            <AlertDialogAction onClick={() => { /* In a real app, you would handle cleanup here */ setShowExitDialog(false); }}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
