//@ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { firestore } from "@/lib/firebase";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	onSnapshot,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
export default function WebRTC() {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [callId, setCallId] = useState("");
	const [isWebRTCSupported, setIsWebRTCSupported] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState("disconnected");
	const [isAudioMuted, setIsAudioMuted] = useState(false);
	const [isVideoOff, setIsVideoOff] = useState(false);

	const pc = useRef<RTCPeerConnection | null>(null);
	const remoteStream = useRef<MediaStream | null>(null);

	const localVideoRef = useRef<HTMLVideoElement | null>(null);
	const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

	useEffect(() => {
		// Check if WebRTC is supported
		if (typeof window !== "undefined" && "RTCPeerConnection" in window) {
			setIsWebRTCSupported(true);
			pc.current = new RTCPeerConnection({
				iceServers: [
					{
						urls: [
							"stun:stun1.l.google.com:19302",
							"stun:stun2.l.google.com:19302",
						],
					},
				],
				iceCandidatePoolSize: 10,
			});
			remoteStream.current = new MediaStream();
			pc.current.onconnectionstatechange = (event) => {
				setConnectionStatus(pc.current.connectionState);
			};
		} else {
			console.error("WebRTC is not supported in this browser.");
		}
		return () => {
			pc.current?.close();
		};
	}, []);

	const handleWebcamStart = async () => {
		if (!isWebRTCSupported) return;

		const mediaStream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});
		setLocalStream(mediaStream);
		// biome-ignore lint/complexity/noForEach: <explanation>
		mediaStream
			.getTracks()
			.forEach((track) => pc.current?.addTrack(track, mediaStream));

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		pc.current!.ontrack = (event) => {
			// biome-ignore lint/complexity/noForEach: <explanation>
			event.streams[0]
				.getTracks()
				.forEach((track) => remoteStream.current?.addTrack(track));
			if (remoteVideoRef.current)
				remoteVideoRef.current.srcObject = remoteStream.current;
		};

		if (localVideoRef.current) localVideoRef.current.srcObject = mediaStream;
	};

	<div className="text-muted-foreground text-sm">
		Connection Status: {connectionStatus}
	</div>;
	const createCall = async () => {
		const callDoc = doc(collection(firestore, "calls"));
		const offerCandidates = collection(callDoc, "offerCandidates");
		const answerCandidates = collection(callDoc, "answerCandidates");

		setCallId(callDoc.id);

		pc.current.onicecandidate = (event) => {
			event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
		};

		const offerDescription = await pc.current.createOffer();
		await pc.current.setLocalDescription(offerDescription);

		await setDoc(callDoc, { offer: offerDescription });

		onSnapshot(callDoc, (snapshot) => {
			const data = snapshot.data();
			if (!pc.current.currentRemoteDescription && data?.answer) {
				pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
			}
		});

		onSnapshot(answerCandidates, (snapshot) => {
			// biome-ignore lint/complexity/noForEach: <explanation>
			snapshot.docChanges().forEach((change) => {
				if (change.type === "added") {
					pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
				}
			});
		});
	};

	const answerCall = async () => {
		const callDoc = doc(firestore, "calls", callId);
		const answerCandidates = collection(callDoc, "answerCandidates");
		const offerCandidates = collection(callDoc, "offerCandidates");

		const callSnapshot = await getDoc(callDoc);
		const callData = callSnapshot.data();
		const offerDescription = callData?.offer;
		await pc.current.setRemoteDescription(
			new RTCSessionDescription(offerDescription),
		);

		const answerDescription = await pc.current.createAnswer();
		await pc.current.setLocalDescription(answerDescription);

		await updateDoc(callDoc, { answer: answerDescription });

		pc.current.onicecandidate = (event) => {
			event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
		};

		onSnapshot(offerCandidates, (snapshot) => {
			// biome-ignore lint/complexity/noForEach: <explanation>
			snapshot.docChanges().forEach((change) => {
				if (change.type === "added") {
					pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
				}
			});
		});
	};

	const toggleAudio = () => {
		if (localStream) {
			// biome-ignore lint/complexity/noForEach: <explanation>
			localStream.getAudioTracks().forEach((track) => {
				track.enabled = !track.enabled;
			});
			setIsAudioMuted(!isAudioMuted);
		}
	};

	const toggleVideo = () => {
		if (localStream) {
			// biome-ignore lint/complexity/noForEach: <explanation>
			localStream.getVideoTracks().forEach((track) => {
				track.enabled = !track.enabled;
			});
			setIsVideoOff(!isVideoOff);
		}
	};

	if (!isWebRTCSupported) {
		return (
			<div className="container mx-auto p-6">
				<Card>
					<CardHeader>
						<CardTitle>WebRTC Unsupported</CardTitle>
					</CardHeader>
					<CardContent>
						<p>
							WebRTC is not supported in this browser. Please use a modern
							browser.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto w-full space-y-6 p-6">
			<div className="w-full">
				<div className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<h1 className="font-os font-semibold text-3xl text-primary">
								Me
							</h1>
							<video
								ref={localVideoRef}
								autoPlay
								muted
								playsInline
								className="aspect-video w-full scale-x-[-1] rounded border bg-black"
							/>
						</div>
						<div>
							<h1 className="font-os font-semibold text-3xl text-primary">
								Her
							</h1>
							{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
							<video
								ref={remoteVideoRef}
								autoPlay
								playsInline
								className="aspect-video w-full scale-x-[-1] rounded border bg-black"
							/>
						</div>{" "}
					</div>

					<div className="flex flex-wrap gap-2">
						<Button onClick={handleWebcamStart}>Start Webcam</Button>
						<Button onClick={createCall} disabled={!localStream}>
							Create Call
						</Button>
						<Input
							value={callId}
							onChange={(e) => setCallId(e.target.value)}
							placeholder="Enter Call ID"
							className="w-48"
						/>
						<Button onClick={answerCall} disabled={!localStream || !callId}>
							Answer Call
						</Button>
						<Button
							onClick={toggleAudio}
							disabled={!localStream}
							variant={isAudioMuted ? "destructive" : "default"}
						>
							{isAudioMuted ? "Unmute" : "Mute"}
						</Button>
						<Button
							onClick={toggleVideo}
							disabled={!localStream}
							variant={isVideoOff ? "destructive" : "default"}
						>
							{isVideoOff ? "Turn On Video" : "Turn Off Video"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
