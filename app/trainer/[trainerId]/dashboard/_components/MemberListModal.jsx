"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, User, Eye, Calendar, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { getMembersByActivity } from "@/actions/trainer/dashboard/getMembersByActivity";

/**
 * Modal แสดงรายชื่อสมาชิกตามประเภทกิจกรรม
 */
export default function MemberListModal({ 
  isOpen, 
  onClose, 
  trainerId, 
  activityType, 
  title 
}) {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState([]);

  // ดึงข้อมูลสมาชิกเมื่อเปิด modal
  useEffect(() => {
    if (isOpen && activityType) {
      fetchMembers();
    }
  }, [isOpen, activityType, trainerId]);

  // กรองข้อมูลเมื่อมีการค้นหา
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm)
      );
      setFilteredMembers(filtered);
    }
  }, [searchTerm, members]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const result = await getMembersByActivity(trainerId, activityType);
      if (result.success) {
        setMembers(result.data.members);
        setFilteredMembers(result.data.members);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusBadge = (member) => {
    if (activityType === 'active_7days') {
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Active 7d
          </div>
        </Badge>
      );
    } else if (activityType === 'inactive_7days') {
      return (
        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Inactive 7d
          </div>
        </Badge>
      );
    } else {
      return (
        <Badge variant={member.registrationStatus === 'active' ? 'default' : 'secondary'}>
          {member.registrationStatus === 'active' ? 'Active' : 'Expired'}
        </Badge>
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาสมาชิก"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ไม่พบสมาชิกที่ตรงกับเงื่อนไข</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div
                  key={member.memberId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Member Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={member.profileImage || "/default-avatar.png"} 
                        alt={member.fullName} 
                      />
                      <AvatarFallback className="text-sm">
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Member Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-lg truncate">
                          {member.fullName}
                        </h3>
                        {getStatusBadge(member)}
                      </div>
                      
                      
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    <Link href={`/trainer/${trainerId}/members/${member.memberId}/overview`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        ดูโปรไฟล์
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}