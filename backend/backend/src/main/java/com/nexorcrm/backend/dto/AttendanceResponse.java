package com.nexorcrm.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class AttendanceResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userRole;
    private LocalDate attendanceDate;
    private String shiftName;
    private String locationName;
    private String checkInLocationName;
    private String checkOutLocationName;

    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    private String status;         // CHECKED_IN, ON_BREAK, ON_LUNCH, CHECKED_OUT
    private String workStatus;     // COMPLETED, INCOMPLETE, HALF_DAY

    private Integer totalWorkMinutes;
    private Integer breakTimeMinutes;
    private Integer lunchTimeMinutes;
    private Integer excessBreakMinutes;
    private Integer excessLunchMinutes;
    private Integer netWorkMinutes;

    private Boolean isLate;
    private Integer lateMinutes;

    private String notes;

    private Integer overtimeMinutes;
    private Boolean isMissedCheckout;
    private LocalDateTime missedCheckoutFlaggedAt;

    private List<AttendanceEventResponse> events;
    private List<AttendanceBreakResponse> breaks;

    // ── Getters & Setters ──

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public String getShiftName() { return shiftName; }
    public void setShiftName(String shiftName) { this.shiftName = shiftName; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public String getCheckInLocationName() { return checkInLocationName; }
    public void setCheckInLocationName(String checkInLocationName) { this.checkInLocationName = checkInLocationName; }

    public String getCheckOutLocationName() { return checkOutLocationName; }
    public void setCheckOutLocationName(String checkOutLocationName) { this.checkOutLocationName = checkOutLocationName; }

    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }

    public LocalDateTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalDateTime checkOutTime) { this.checkOutTime = checkOutTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getWorkStatus() { return workStatus; }
    public void setWorkStatus(String workStatus) { this.workStatus = workStatus; }

    public Integer getTotalWorkMinutes() { return totalWorkMinutes; }
    public void setTotalWorkMinutes(Integer totalWorkMinutes) { this.totalWorkMinutes = totalWorkMinutes; }

    public Integer getBreakTimeMinutes() { return breakTimeMinutes; }
    public void setBreakTimeMinutes(Integer breakTimeMinutes) { this.breakTimeMinutes = breakTimeMinutes; }

    public Integer getLunchTimeMinutes() { return lunchTimeMinutes; }
    public void setLunchTimeMinutes(Integer lunchTimeMinutes) { this.lunchTimeMinutes = lunchTimeMinutes; }

    public Integer getExcessBreakMinutes() { return excessBreakMinutes; }
    public void setExcessBreakMinutes(Integer excessBreakMinutes) { this.excessBreakMinutes = excessBreakMinutes; }

    public Integer getExcessLunchMinutes() { return excessLunchMinutes; }
    public void setExcessLunchMinutes(Integer excessLunchMinutes) { this.excessLunchMinutes = excessLunchMinutes; }

    public Integer getNetWorkMinutes() { return netWorkMinutes; }
    public void setNetWorkMinutes(Integer netWorkMinutes) { this.netWorkMinutes = netWorkMinutes; }

    public Boolean getIsLate() { return isLate; }
    public void setIsLate(Boolean isLate) { this.isLate = isLate; }

    public Integer getLateMinutes() { return lateMinutes; }
    public void setLateMinutes(Integer lateMinutes) { this.lateMinutes = lateMinutes; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Integer getOvertimeMinutes() { return overtimeMinutes; }
    public void setOvertimeMinutes(Integer overtimeMinutes) { this.overtimeMinutes = overtimeMinutes; }

    public Boolean getIsMissedCheckout() { return isMissedCheckout; }
    public void setIsMissedCheckout(Boolean isMissedCheckout) { this.isMissedCheckout = isMissedCheckout; }

    public LocalDateTime getMissedCheckoutFlaggedAt() { return missedCheckoutFlaggedAt; }
    public void setMissedCheckoutFlaggedAt(LocalDateTime missedCheckoutFlaggedAt) { this.missedCheckoutFlaggedAt = missedCheckoutFlaggedAt; }

    public List<AttendanceEventResponse> getEvents() { return events; }
    public void setEvents(List<AttendanceEventResponse> events) { this.events = events; }

    public List<AttendanceBreakResponse> getBreaks() { return breaks; }
    public void setBreaks(List<AttendanceBreakResponse> breaks) { this.breaks = breaks; }
}
